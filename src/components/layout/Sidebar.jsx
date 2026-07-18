import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, MessageSquare, Trash2, Pencil, Check, X,
  Settings, ChevronDown, Sparkles,
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Tooltip } from '../ui/Tooltip';
import { FeedbackModal } from '../FeedbackModal';


function ChatItem({ chat, isActive, onSelect, onDelete, onRename }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(chat.title || 'New Chat');
  const [showActions, setShowActions] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleRenameSubmit = () => {
    if (title.trim()) {
      onRename(chat.id, title.trim());
    }
    setEditing(false);
  };

  const handleRenameKey = (e) => {
    if (e.key === 'Enter') handleRenameSubmit();
    if (e.key === 'Escape') { setTitle(chat.title); setEditing(false); }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 ${
        isActive
          ? 'bg-primary/15 text-white'
          : 'text-muted hover:bg-white/5 hover:text-white/80'
      }`}
      onClick={(e) => {
        if (!editing && !isActive) {
          onSelect(chat.id);
        }
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => !editing && setShowActions(false)}
    >
      <MessageSquare size={14} className="shrink-0 opacity-60" />

      {editing ? (
        <div className="flex-1 flex items-center gap-1.5 min-w-0">
          <input
            ref={inputRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={handleRenameKey}
            onBlur={handleRenameSubmit}
            className="flex-1 bg-white/10 text-white text-xs px-2 py-0.5 rounded-lg border border-primary/30 outline-none min-w-0"
            onClick={e => e.stopPropagation()}
          />
          <button onClick={e => { e.stopPropagation(); handleRenameSubmit(); }} className="text-green-400 hover:text-green-300 shrink-0">
            <Check size={12} />
          </button>
          <button onClick={e => { e.stopPropagation(); setTitle(chat.title); setEditing(false); }} className="text-muted hover:text-white shrink-0">
            <X size={12} />
          </button>
        </div>
      ) : (
        <span className="flex-1 text-xs truncate">{chat.title || 'New Chat'}</span>
      )}

      {/* Action buttons */}
      {!editing && showActions && (
        <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setEditing(true)}
            className="p-1 rounded-md hover:bg-white/10 text-muted hover:text-white transition-colors"
            title="Rename"
          >
            <Pencil size={11} />
          </button>
          <button
            onClick={() => onDelete(chat.id)}
            className="p-1 rounded-md hover:bg-red-500/20 text-muted hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 size={11} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

export function Sidebar({ open, onClose }) {
  const { chats, activeChatId, newChat, selectChat, deleteChat, renameChat } = useChat();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const handleNewChat = async () => {
    await newChat();
    onClose?.();
  };

  const handleSelectChat = (chatId) => {
    selectChat(chatId);
    onClose?.();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center overflow-hidden">
          <img src="/logo-brain.png" alt="FableMind Brain" className="w-full h-full object-cover" />
        </div>
        <div className="h-6">
          <img src="/logo-text.png" alt="FableMind Design AI" className="h-full object-contain" />
        </div>
      </div>

      {/* New Chat button */}
      <div className="px-3 py-3">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 text-muted hover:text-white text-xs font-medium transition-all duration-200 group"
        >
          <Plus size={14} className="group-hover:text-primary transition-colors" />
          <span>New Chat</span>
          <span className="ml-auto text-[10px] opacity-40 font-mono">Ctrl+⇧+O</span>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-3">
        {chats.length > 0 ? (
          <div className="space-y-0.5">
            <p className="text-[10px] font-medium text-muted/50 uppercase tracking-wider px-3 py-2">
              Recent Chats
            </p>
            <AnimatePresence>
              {chats.map(chat => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === activeChatId}
                  onSelect={handleSelectChat}
                  onDelete={deleteChat}
                  onRename={renameChat}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles size={24} className="text-primary/30 mb-3" />
            <p className="text-xs text-muted/50">No chats yet.<br />Start a conversation!</p>
          </div>
        )}
      </div>

      {/* Bottom: Settings + User */}
      <div className="border-t border-border p-3 space-y-1">
        <button
          onClick={() => setIsFeedbackOpen(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted hover:text-white hover:bg-white/5 text-xs transition-colors group"
        >
          <MessageSquare size={14} className="group-hover:scale-110 transition-transform duration-300" />
          <span>Send Feedback</span>
        </button>

        <Link
          to="/settings"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted hover:text-white hover:bg-white/5 text-xs transition-colors group"
        >
          <Settings size={14} className="group-hover:rotate-45 transition-transform duration-300" />
          <span>Settings</span>
        </Link>

        {/* User info */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
          onClick={async () => { await logout(); navigate('/'); }}
        >
          <Avatar user={user} size="xs" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white/80 truncate">
              {user?.displayName || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-[10px] text-muted truncate">{user?.email}</p>
          </div>
          <span className="text-[10px] text-muted/50 opacity-0 group-hover:opacity-100 transition-opacity">Logout</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 shrink-0 border-r border-border bg-card/50 h-full flex-col">
        {sidebarContent}
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border md:hidden flex flex-col"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
}
