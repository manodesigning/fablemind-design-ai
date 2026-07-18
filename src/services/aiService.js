import { AI_PROVIDERS, PROVIDER_ORDER, getApiKey, hasApiKey } from '../config/aiProviders';
import { loadSystemPrompt } from '../utils/loadSystemPrompt';
import { MAX_CONTEXT_MESSAGES } from '../config/constants';

/**
 * Active provider status — reactive state for the UI badge.
 * Callbacks registered via onProviderChange().
 */
let activeProvider = 'groq';
const providerChangeListeners = new Set();

export function getActiveProvider() { return activeProvider; }

export function onProviderChange(callback) {
  providerChangeListeners.add(callback);
  return () => providerChangeListeners.delete(callback);
}

function setActiveProvider(id) {
  activeProvider = id;
  providerChangeListeners.forEach(cb => cb(id));
}

/**
 * Build the request body for a given provider.
 */
function buildRequestBody(provider, model, messages) {
  return {
    model,
    messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 4096,
  };
}

/**
 * Build headers for a given provider.
 */
function buildHeaders(provider, apiKey) {
  const base = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };
  if (provider.id === 'openrouter') {
    base['HTTP-Referer'] = window.location.origin;
    base['X-Title'] = 'FableMind Design AI';
  }
  return base;
}

/**
 * Parse an SSE stream and yield text chunks.
 */
async function* parseStream(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep incomplete line in buffer

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (!trimmed.startsWith('data: ')) continue;

      try {
        const json = JSON.parse(trimmed.slice(6));
        const content = json.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // Ignore malformed chunks
      }
    }
  }
}

/**
 * Try streaming from a specific provider.
 * Returns an async generator or throws on failure.
 */
async function tryProvider(providerId, model, messages) {
  const provider = AI_PROVIDERS[providerId];
  const apiKey = getApiKey(providerId);

  if (!apiKey) throw new Error(`No API key for ${provider.name}`);

  const body = buildRequestBody(provider, model, messages);
  const headers = buildHeaders(provider, apiKey);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`${provider.name} error ${response.status}: ${err}`);
    }

    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Parse error status from error message string.
 */
function getErrorStatus(message) {
  const match = message.match(/error (\d+):/i);
  return match ? parseInt(match[1]) : null;
}

/**
 * Main streaming chat function.
 *
 * @param {Object} options
 * @param {string[]} options.messages - Array of {role, content} message objects
 * @param {string} options.preferredProvider - 'groq' | 'openrouter' | 'auto'
 * @param {string} options.model - Model ID to use
 * @param {Function} options.onChunk - Called with each text chunk
 * @param {Function} options.onDone - Called when stream completes
 * @param {Function} options.onError - Called on unrecoverable error
 * @param {Function} options.onProviderSwitch - Called when switching providers
 */
export async function streamChat({
  messages,
  preferredProvider = 'auto',
  model,
  onChunk,
  onDone,
  onError,
  onProviderSwitch,
}) {
  const systemPrompt = await loadSystemPrompt();

  // Prepend system message and limit context window
  const contextMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-MAX_CONTEXT_MESSAGES),
  ];

  // Determine provider order
  let providerOrder;
  if (preferredProvider === 'auto') {
    providerOrder = PROVIDER_ORDER;
  } else {
    // Try preferred first, then others
    providerOrder = [
      preferredProvider,
      ...PROVIDER_ORDER.filter(p => p !== preferredProvider),
    ];
  }

  let lastError = null;
  let hitRateLimit = false;

  for (const providerId of providerOrder) {
    // Skip providers without API keys
    if (!hasApiKey(providerId)) {
      console.log(`Skipping ${providerId}: no API key configured`);
      continue;
    }

    const providerConfig = AI_PROVIDERS[providerId];
    const modelToUse = model || providerConfig.defaultModel;

    try {
      if (lastError && onProviderSwitch) {
        onProviderSwitch(providerId, lastError.message);
      }

      const response = await tryProvider(providerId, modelToUse, contextMessages);
      setActiveProvider(providerId);

      let fullContent = '';
      for await (const chunk of parseStream(response)) {
        fullContent += chunk;
        onChunk(chunk);
      }

      onDone(fullContent, providerId);
      return;
    } catch (err) {
      console.warn(`Provider ${providerId} failed:`, err.message);
      const status = getErrorStatus(err.message);

      // If rate limited (429), try a lighter/faster model on same provider first
      if (status === 429 && providerId === 'groq') {
        hitRateLimit = true;
        const fallbackModel = 'llama-3.1-8b-instant'; // lighter Groq model
        if (fallbackModel !== modelToUse) {
          try {
            console.log('Groq rate limited, trying lighter model:', fallbackModel);
            const fallbackResp = await tryProvider(providerId, fallbackModel, contextMessages);
            setActiveProvider(providerId);
            let fullContent = '';
            for await (const chunk of parseStream(fallbackResp)) {
              fullContent += chunk;
              onChunk(chunk);
            }
            onDone(fullContent, providerId);
            return;
          } catch (fallbackErr) {
            console.warn('Groq fallback model also failed:', fallbackErr.message);
          }
        }
      }

      lastError = err;
    }
  }

  // All providers failed — give a clear, actionable error message
  let errorMsg = '⚠️ AI response failed. Please try again.';

  if (hitRateLimit) {
    const hasOpenRouter = hasApiKey('openrouter');
    if (!hasOpenRouter) {
      errorMsg = '⚡ Groq rate limit reached. To keep chatting:\n• Wait 1–2 minutes and try again, OR\n• Go to Settings → add a free OpenRouter API key (openrouter.ai) to use as backup.';
    } else {
      errorMsg = '⚡ All providers are rate limited. Please wait 1–2 minutes and try again.';
    }
  } else if (lastError?.message?.includes('401') || lastError?.message?.includes('Authentication')) {
    errorMsg = '🔑 Invalid API key. Please go to Settings and check your API key.';
  } else if (lastError?.message?.includes('No API key')) {
    errorMsg = '🔑 No API key found. Please go to Settings → API Keys and add your Groq or OpenRouter key.';
  } else if (lastError) {
    errorMsg = lastError.message;
  }

  onError(errorMsg);
}

/**
 * Non-streaming version for simple completions.
 */
export async function complete({ messages, providerId, model }) {
  const systemPrompt = await loadSystemPrompt();
  const contextMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-MAX_CONTEXT_MESSAGES),
  ];

  const provider = AI_PROVIDERS[providerId || activeProvider];
  const apiKey = getApiKey(provider.id);
  if (!apiKey) throw new Error(`No API key for ${provider.name}`);

  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: buildHeaders(provider, apiKey),
    body: JSON.stringify({
      model: model || provider.defaultModel,
      messages: contextMessages,
      stream: false,
      temperature: 0.7,
      max_tokens: 200,
    }),
  });

  if (!response.ok) throw new Error(`AI error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
