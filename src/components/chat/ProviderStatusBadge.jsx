import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shuffle } from 'lucide-react';
import { AI_PROVIDERS } from '../../config/aiProviders';

export function ProviderStatusBadge({ provider }) {
  const config = AI_PROVIDERS[provider];
  if (!config) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={provider}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
        style={{
          backgroundColor: `${config.color}15`,
          borderColor: `${config.color}30`,
          color: config.color,
        }}
        title={`Using ${config.name}: ${config.description}`}
      >
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: config.color }} />
        <span>{config.name}</span>
      </motion.div>
    </AnimatePresence>
  );
}
