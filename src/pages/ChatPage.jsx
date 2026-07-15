import { AppLayout } from '../components/layout/AppLayout';
import { ChatArea } from '../components/chat/ChatArea';
import { ChatInput } from '../components/chat/ChatInput';
import { ProviderStatusBadge } from '../components/chat/ProviderStatusBadge';
import { useChat } from '../context/ChatContext';

export default function ChatPage() {
  const { activeProvider, chats, activeChatId } = useChat();
  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <AppLayout>
      {/* Desktop: provider badge in top bar */}
      <div className="hidden md:flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          {activeChat && (
            <h2 className="text-sm font-medium text-white/70 truncate max-w-md">
              {activeChat.title}
            </h2>
          )}
        </div>
        <ProviderStatusBadge provider={activeProvider} />
      </div>

      {/* Messages */}
      <ChatArea />

      {/* Input */}
      <ChatInput />
    </AppLayout>
  );
}
