// AI Provider Configuration
// Add new providers here without touching the frontend logic

export const AI_PROVIDERS = {
  groq: {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference, low latency',
    baseUrl: 'https://api.groq.com/openai/v1',
    color: '#F55036',
    icon: '⚡',
    envKey: 'VITE_GROQ_API_KEY',
    storageKey: 'fablemind_groq_api_key',
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', description: 'Highly capable' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', description: 'Lightning fast' },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', description: 'Google Gemma' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'Mistral AI' },
    ],
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Multi-model access, reliable fallback',
    baseUrl: 'https://openrouter.ai/api/v1',
    color: '#6D5EF5',
    icon: '🔀',
    envKey: 'VITE_OPENROUTER_API_KEY',
    storageKey: 'fablemind_openrouter_api_key',
    defaultModel: 'deepseek/deepseek-r1-0528:free',
    models: [
      { id: 'deepseek/deepseek-r1-0528:free', name: 'DeepSeek R1 (Free)', description: 'Powerful reasoning model' },
      { id: 'deepseek/deepseek-chat-v3-0324:free', name: 'DeepSeek Chat V3 (Free)', description: 'Conversational AI' },
      { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B (Free)', description: 'Google Gemma' },
      { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)', description: 'Meta Llama' },
      { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)', description: 'Mistral AI' },
      { id: 'qwen/qwen3-235b-a22b:free', name: 'Qwen3 235B (Free)', description: 'Alibaba Qwen' },
    ],
  },
};

export const PROVIDER_ORDER = ['groq', 'openrouter'];

export const DEFAULT_PROVIDER = 'groq';

export function getProviderConfig(providerId) {
  return AI_PROVIDERS[providerId] || AI_PROVIDERS[DEFAULT_PROVIDER];
}

export function getApiKey(providerId) {
  const provider = getProviderConfig(providerId);
  // Check localStorage first (user-entered key)
  const storedKey = localStorage.getItem(provider.storageKey);
  if (storedKey && storedKey.trim()) return storedKey.trim();
  // Fall back to env variable
  const envKey = import.meta.env[provider.envKey];
  if (envKey && envKey.trim()) return envKey.trim();
  return null;
}

export function hasApiKey(providerId) {
  return Boolean(getApiKey(providerId));
}
