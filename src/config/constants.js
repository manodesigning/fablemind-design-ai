export const APP_NAME = 'FableMind Design AI';
export const APP_TAGLINE = 'Your AI Design Partner';
export const APP_DESCRIPTION = 'Professional AI Assistant for UI/UX, Graphic Design, Branding, Design Systems, Accessibility, HTML, CSS, Tailwind CSS, React UI, UX Writing, and Creative Thinking.';

export const SYSTEM_PROMPT_PATH = '/sys_prompt/sys_prompt.txt';

export const STORAGE_KEYS = {
  THEME: 'fablemind_theme',
  PROVIDER: 'fablemind_provider',
  MODEL: 'fablemind_model',
  FONT_SIZE: 'fablemind_font_size',
  SIDEBAR_OPEN: 'fablemind_sidebar_open',
};

export const THEME = {
  DARK: 'dark',
  LIGHT: 'light',
};

export const COLORS = {
  primary: '#6D5EF5',
  accent: '#8B7FFF',
  background: '#0B0B0F',
  card: '#15151B',
  border: '#1E1E28',
  text: '#FFFFFF',
  muted: '#6B7280',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
};

export const MAX_CONTEXT_MESSAGES = 40; // Max messages to send for context

export const STREAM_TIMEOUT_MS = 30000; // 30 seconds before switching provider

export const FONT_SIZES = [
  { label: 'Small', value: 'sm', class: 'text-sm' },
  { label: 'Medium', value: 'md', class: 'text-base' },
  { label: 'Large', value: 'lg', class: 'text-lg' },
];

export const KEYBOARD_SHORTCUTS = {
  NEW_CHAT: 'ctrl+shift+o',
  TOGGLE_SIDEBAR: 'ctrl+\\',
  FOCUS_INPUT: '/',
  SETTINGS: 'ctrl+,',
};
