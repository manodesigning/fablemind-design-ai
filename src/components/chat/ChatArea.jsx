import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Palette, Sparkles, Zap, Type, Layout, Eye } from 'lucide-react';
import { MessageBubble, StreamingMessageBubble } from './MessageBubble';
import { MessageSkeleton } from '../ui/Skeleton';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

const SUGGESTION_PROMPTS = [
  { icon: Palette, text: 'Review my color palette for accessibility', label: 'Color Review' },
  { icon: Layout, text: 'Help me design a clean dashboard layout', label: 'Layout Design' },
  { icon: Type, text: 'Suggest font pairings for a modern SaaS app', label: 'Typography' },
  { icon: Eye, text: 'Explain the 8-point grid system', label: 'Grid System' },
  { icon: Sparkles, text: 'What are the best UI micro-interaction patterns?', label: 'Micro-interactions' },
  { icon: Zap, text: 'How do I improve my portfolio case studies?', label: 'Portfolio' },
];

function EmptyState({ onSend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full px-4 py-12 text-center"
    >
      {/* Logo mark */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-accent to-purple-400 flex items-center justify-center mb-6 shadow-2xl shadow-primary/30"
      >
        <span className="text-2xl font-bold text-white">F</span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-white mb-2"
      >
        What can I design for you?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted text-sm max-w-sm mb-8"
      >
        I'm your AI design partner. Ask me anything about UI/UX, branding, CSS, React, accessibility, and more.
      </motion.p>

      {/* Suggestion chips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-w-2xl w-full"
      >
        {SUGGESTION_PROMPTS.map(({ icon: Icon, text, label }, i) => (
          <motion.button
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.05 }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSend(text)}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-primary/5 text-left transition-all duration-200 group"
          >
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors shrink-0">
              <Icon size={14} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted mb-0.5">{label}</p>
              <p className="text-xs text-muted/70 leading-relaxed">{text}</p>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}

export function ChatArea() {
  const { messages, isStreaming, streamingContent, sendMessage, activeChatId } = useChat();
  const { user } = useAuth();
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const isEmpty = messages.length === 0 && !isStreaming;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto custom-scrollbar"
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      {isEmpty ? (
        <EmptyState onSend={sendMessage} />
      ) : (
        <div className="max-w-3xl mx-auto py-4">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                message={msg}
                user={user}
              />
            ))}
          </AnimatePresence>

          {/* Streaming response */}
          {isStreaming && (
            <StreamingMessageBubble content={streamingContent} />
          )}

          <div ref={bottomRef} className="h-4" />
        </div>
      )}
    </div>
  );
}
