import {
  createContext, useContext, useState, useCallback, useRef, useEffect,
} from 'react';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';
import {
  createChat, getMessages, addMessage, subscribeToChats, subscribeToMessages,
  deleteChat as fbDeleteChat, updateChatTitle, clearAllChats,
} from '../services/firebaseService';
import { streamChat, getActiveProvider, onProviderChange } from '../services/aiService';
import { AI_PROVIDERS } from '../config/aiProviders';
import toast from 'react-hot-toast';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const { provider: preferredProvider, getModelForProvider } = useSettings();

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [activeProvider, setActiveProviderState] = useState(getActiveProvider());

  const abortRef = useRef(null);
  const unsubChatsRef = useRef(null);

  // Subscribe to provider changes
  useEffect(() => {
    const unsub = onProviderChange(setActiveProviderState);
    return unsub;
  }, []);

  // Subscribe to chats when user logs in
  useEffect(() => {
    if (!user) {
      setChats([]);
      setActiveChatId(null);
      setMessages([]);
      return;
    }
    unsubChatsRef.current?.();
    unsubChatsRef.current = subscribeToChats(user.uid, setChats);
    return () => unsubChatsRef.current?.();
  }, [user]);

  // Load messages when active chat changes
  const unsubMessagesRef = useRef(null);
  
  useEffect(() => {
    if (!user || !activeChatId) {
      setMessages([]);
      return;
    }
    
    unsubMessagesRef.current?.();
    unsubMessagesRef.current = subscribeToMessages(user.uid, activeChatId, setMessages);
    
    return () => unsubMessagesRef.current?.();
  }, [user, activeChatId]);

  const newChat = useCallback(async () => {
    if (!user) return null;
    const chatId = await createChat(user.uid, 'New Chat');
    setActiveChatId(chatId);
    setMessages([]);
    return chatId;
  }, [user]);

  const selectChat = useCallback((chatId) => {
    if (isStreaming) return; // Don't switch while streaming
    setActiveChatId(chatId);
  }, [isStreaming]);

  const deleteChat = useCallback(async (chatId) => {
    if (!user) return;
    await fbDeleteChat(user.uid, chatId);
    if (activeChatId === chatId) {
      setActiveChatId(null);
      setMessages([]);
    }
  }, [user, activeChatId]);

  const renameChat = useCallback(async (chatId, title) => {
    if (!user) return;
    await updateChatTitle(user.uid, chatId, title);
  }, [user]);

  const clearHistory = useCallback(async () => {
    if (!user) return;
    await clearAllChats(user.uid);
    setActiveChatId(null);
    setMessages([]);
  }, [user]);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isStreaming || !user) return;

    try {
      let chatId = activeChatId;

      // Create new chat if none active
      if (!chatId) {
        chatId = await createChat(user.uid, content.slice(0, 50));
        setActiveChatId(chatId);
      }

      // Add user message to UI immediately
      const userMsg = { id: Date.now().toString(), role: 'user', content, createdAt: new Date() };
      setMessages(prev => [...prev, userMsg]);

      // Persist user message in background (don't block UI)
      addMessage(user.uid, chatId, { role: 'user', content }).catch(err => {
        console.error('Failed to save message to Firebase:', err);
        toast.error('Warning: Message not saved (Offline/Network error)', { duration: 3000 });
      });

      // Auto-title the chat from first message
      const chat = chats.find(c => c.id === chatId);
      if (chat?.title === 'New Chat' || !chat) {
        const shortTitle = content.slice(0, 60).trim();
        updateChatTitle(user.uid, chatId, shortTitle).catch(console.error);
      }

      // Start streaming AI response
      setIsStreaming(true);
      setStreamingContent('');

      // Determine provider and model
      const resolvedProvider = preferredProvider === 'auto'
        ? 'groq'
        : preferredProvider;
      const model = getModelForProvider(resolvedProvider);

      // Build message history for context
      const msgHistory = [
        ...messages.filter(m => m.id !== userMsg.id),
        userMsg,
      ].map(m => ({ role: m.role, content: m.content }));

      let fullContent = '';

      await streamChat({
        messages: msgHistory,
        preferredProvider: preferredProvider,
        model,
        onChunk: (chunk) => {
          fullContent += chunk;
          setStreamingContent(fullContent);
        },
        onDone: async (content, usedProvider) => {
          setIsStreaming(false);
          setStreamingContent('');

          const aiMsg = {
            id: Date.now().toString() + '_ai',
            role: 'assistant',
            content,
            provider: usedProvider,
            model: getModelForProvider(usedProvider),
            createdAt: new Date(),
          };
          setMessages(prev => [...prev, aiMsg]);

          // Persist AI message in background
          addMessage(user.uid, chatId, {
            role: 'assistant',
            content,
            provider: usedProvider,
            model: getModelForProvider(usedProvider),
          }).catch(console.error);
        },
        onError: (err) => {
          setIsStreaming(false);
          setStreamingContent('');
          toast.error(err, { duration: 5000 });
        },
        onProviderSwitch: (newProvider, reason) => {
          toast(`Switched to ${AI_PROVIDERS[newProvider]?.name} (${reason.slice(0, 40)}...)`, {
            icon: '🔀',
            duration: 3000,
          });
        },
      });
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message: ' + err.message, { duration: 5000 });
      setIsStreaming(false);
    }
  }, [user, activeChatId, isStreaming, messages, chats, preferredProvider, getModelForProvider]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return (
    <ChatContext.Provider value={{
      chats, activeChatId, messages, isStreaming, streamingContent,
      activeProvider,
      newChat, selectChat, sendMessage, deleteChat, renameChat,
      clearHistory, stopStreaming, setActiveChatId,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
