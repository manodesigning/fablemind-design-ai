import { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../config/constants';
import { AI_PROVIDERS, DEFAULT_PROVIDER } from '../config/aiProviders';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [provider, setProviderState] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.PROVIDER) || 'auto'
  );
  const [models, setModels] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MODEL);
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });
  const [fontSize, setFontSizeState] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.FONT_SIZE) || 'md'
  );

  const setProvider = (val) => {
    setProviderState(val);
    localStorage.setItem(STORAGE_KEYS.PROVIDER, val);
  };

  const setModelForProvider = (providerId, modelId) => {
    const updated = { ...models, [providerId]: modelId };
    setModels(updated);
    localStorage.setItem(STORAGE_KEYS.MODEL, JSON.stringify(updated));
  };

  const getModelForProvider = (providerId) => {
    const config = AI_PROVIDERS[providerId];
    if (!config) return '';
    const storedModel = models[providerId];
    // Verify the stored model still exists in the provider's model list
    const isValid = storedModel && config.models.some(m => m.id === storedModel);
    return isValid ? storedModel : config.defaultModel;
  };

  const setFontSize = (val) => {
    setFontSizeState(val);
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, val);
  };

  // API key management (stored in localStorage, never server-side)
  const saveApiKey = (providerId, key) => {
    const storageKey = AI_PROVIDERS[providerId]?.storageKey;
    if (storageKey) localStorage.setItem(storageKey, key);
  };

  const getApiKey = (providerId) => {
    const storageKey = AI_PROVIDERS[providerId]?.storageKey;
    return storageKey ? localStorage.getItem(storageKey) || '' : '';
  };

  const removeApiKey = (providerId) => {
    const storageKey = AI_PROVIDERS[providerId]?.storageKey;
    if (storageKey) localStorage.removeItem(storageKey);
  };

  return (
    <SettingsContext.Provider value={{
      provider, setProvider,
      models, setModelForProvider, getModelForProvider,
      fontSize, setFontSize,
      saveApiKey, getApiKey, removeApiKey,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
