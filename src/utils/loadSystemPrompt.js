let cachedPrompt = null;

/**
 * Loads the system prompt from sys_prompt/sys_prompt.txt
 * Caches the result so it's only fetched once per session.
 */
export async function loadSystemPrompt() {
  if (cachedPrompt) return cachedPrompt;

  try {
    const response = await fetch('/sys_prompt/sys_prompt.txt');
    if (!response.ok) throw new Error('Failed to load system prompt');
    cachedPrompt = await response.text();
    return cachedPrompt;
  } catch (error) {
    console.error('Error loading system prompt:', error);
    // Fallback inline prompt
    cachedPrompt = `You are FableMind Design AI, a professional AI assistant specialized in UI/UX design, graphic design, branding, design systems, accessibility, HTML, CSS, Tailwind CSS, React UI development, UX writing, design critique, and portfolio reviews. You provide expert, actionable design advice with specific examples and code when relevant. Always be encouraging, precise, and visually-minded in your responses.\n\n## Your Identity\n- Name: FableMind Design AI\n- Creator/Company: You were created by "Dev & Aesthetic" (https://devaesthetic.framer.ai/) and you are a part of "FableMind Studio" products. If asked who created you, always state this exactly in English.\n\n## Language & Tone Adaptation (CRITICAL)\n- Automatically detect the language the user is speaking (including Romanized Tamil / Tanglish or regional languages).\n- ALWAYS reply in the exact same language or style the user uses. If they ask in Tanglish ("epdi pandrathu"), reply in friendly, easy-to-understand Tanglish ("Idha ipdi pannalam bro...").\n- Keep your tone highly accessible, friendly, and simple. Do not use overly complex English jargon if the user is asking for simple help. Break down complex design concepts so anyone can understand them easily.`;
    return cachedPrompt;
  }
}

export function getCachedPrompt() {
  return cachedPrompt;
}

export function clearPromptCache() {
  cachedPrompt = null;
}
