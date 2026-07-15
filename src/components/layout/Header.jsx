import { Menu, Plus } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { ProviderStatusBadge } from '../chat/ProviderStatusBadge';

export function Header({ onMenuClick }) {
  const { chats, activeChatId, newChat, activeProvider } = useChat();
  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-xl text-muted hover:text-white hover:bg-white/5 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Chat title */}
      <div className="flex-1 text-center px-3">
        <p className="text-sm font-semibold text-white truncate">
          {activeChat?.title || 'FableMind Design AI'}
        </p>
        <div className="flex justify-center mt-0.5">
          <ProviderStatusBadge provider={activeProvider} />
        </div>
      </div>

      {/* New chat */}
      <button
        onClick={newChat}
        className="p-2 rounded-xl text-muted hover:text-white hover:bg-white/5 transition-colors"
        aria-label="New chat"
      >
        <Plus size={18} />
      </button>
    </header>
  );
}
