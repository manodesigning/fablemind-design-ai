import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Square, Sparkles } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const PLACEHOLDERS = [
  'Ask me about UI/UX design principles...',
  'Need help with Tailwind CSS layout?',
  'Review my color palette choices...',
  'Explain WCAG accessibility standards...',
  'Help me design a button component...',
  'What font pairs work for a SaaS app?',
  'Critique my landing page design...',
  'How to create a design system?',
];

export function ChatInput() {
  const [value, setValue] = useState('');
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const textareaRef = useRef(null);
  const { sendMessage, isStreaming, stopStreaming } = useChat();

  // Rotate placeholders
  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % PLACEHOLDERS.length;
      setPlaceholder(PLACEHOLDERS[idx]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [value]);

  const handleSubmit = useCallback(async () => {
    if (!value.trim() || isStreaming) return;
    const msg = value.trim();
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessage(msg);
  }, [value, isStreaming, sendMessage]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const canSend = value.trim().length > 0 && !isStreaming;

  return (
    <div className="relative px-4 pb-4 pt-2">
      {/* Gradient fade above input */}
      <div className="absolute left-0 right-0 -top-8 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <div className="relative max-w-3xl mx-auto">
        <div className="relative flex items-end gap-3 bg-card border border-border rounded-2xl px-4 py-3 shadow-2xl shadow-black/30 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200">
          {/* Sparkle icon */}
          <div className="mb-1 shrink-0 text-primary/50">
            <Sparkles size={16} />
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isStreaming}
            rows={1}
            aria-label="Chat message input"
            className="flex-1 bg-transparent text-white text-sm placeholder:text-muted/40 resize-none focus:outline-none min-h-[24px] max-h-[160px] leading-6 py-0 disabled:opacity-50 custom-scrollbar"
            style={{ scrollbarWidth: 'thin' }}
          />

          {/* Send / Stop button */}
          <AnimatePresence mode="wait">
            {isStreaming ? (
              <motion.button
                key="stop"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={stopStreaming}
                className="shrink-0 mb-0.5 p-1.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                aria-label="Stop generating"
                title="Stop generating"
              >
                <Square size={16} fill="currentColor" />
              </motion.button>
            ) : (
              <motion.button
                key="send"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={handleSubmit}
                disabled={!canSend}
                className="shrink-0 mb-0.5 p-1.5 rounded-xl bg-primary text-white hover:bg-primary-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="Send message"
                title="Send message (Enter)"
              >
                <Send size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Hint text */}
        <p className="text-center text-[11px] text-muted/40 mt-2">
          Press <kbd className="px-1 py-0.5 rounded bg-white/5 font-mono text-[10px]">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-white/5 font-mono text-[10px]">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
