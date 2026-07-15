import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { StreamingIndicator } from './StreamingIndicator';
import { Avatar, AIAvatar } from '../ui/Avatar';
import { Tooltip } from '../ui/Tooltip';
import { AI_PROVIDERS } from '../../config/aiProviders';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <Tooltip content={copied ? 'Copied!' : 'Copy message'}>
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
        aria-label={copied ? 'Copied' : 'Copy message'}
      >
        {copied
          ? <Check size={13} className="text-green-400" />
          : <Copy size={13} />
        }
      </button>
    </Tooltip>
  );
}

export function MessageBubble({ message, user }) {
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming;
  const providerConfig = message.provider ? AI_PROVIDERS[message.provider] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`group flex gap-3 px-4 py-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="shrink-0 mt-1">
          <AIAvatar size="sm" />
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[85%] md:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* User message bubble */}
        {isUser ? (
          <div className="px-4 py-2.5 rounded-2xl rounded-tr-sm bg-primary/90 text-white text-sm leading-relaxed">
            {message.content}
          </div>
        ) : (
          /* AI response */
          <div className="w-full">
            {isStreaming && !message.content ? (
              <StreamingIndicator />
            ) : (
              <MarkdownRenderer content={message.content || ''} />
            )}
          </div>
        )}

        {/* Footer: provider badge + copy button */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {!isUser && providerConfig && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium opacity-40"
              style={{ color: providerConfig.color }}
            >
              {providerConfig.name}
            </span>
          )}
          {message.content && <CopyButton text={message.content} />}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="shrink-0 mt-1">
          <Avatar user={user} size="sm" />
        </div>
      )}
    </motion.div>
  );
}

export function StreamingMessageBubble({ content }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 px-4 py-3"
    >
      <div className="shrink-0 mt-1">
        <AIAvatar size="sm" />
      </div>
      <div className="flex-1 max-w-[85%] md:max-w-[75%]">
        {content ? (
          <MarkdownRenderer content={content} />
        ) : (
          <StreamingIndicator />
        )}
      </div>
    </motion.div>
  );
}
