import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Key, Cpu, Palette, Trash2, LogOut,
  Sun, Moon, ChevronDown, Eye, EyeOff, Check, AlertCircle,
  Zap, Shuffle, User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useChat } from '../context/ChatContext';
import { AI_PROVIDERS, PROVIDER_ORDER } from '../config/aiProviders';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Avatar } from '../components/ui/Avatar';
import toast from 'react-hot-toast';

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
        <Icon size={16} className="text-primary" />
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function ProviderCard({ providerId, isSelected, onSelect }) {
  const config = AI_PROVIDERS[providerId];
  return (
    <button
      onClick={() => onSelect(providerId)}
      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 text-left ${
        isSelected
          ? 'border-primary/50 bg-primary/10'
          : 'border-border hover:border-border/80 hover:bg-white/3'
      }`}
    >
      <span className="text-xl shrink-0">{config.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{config.name}</p>
        <p className="text-xs text-muted truncate">{config.description}</p>
      </div>
      {isSelected && <Check size={14} className="text-primary shrink-0" />}
    </button>
  );
}

function ApiKeyField({ providerId }) {
  const { saveApiKey, getApiKey, removeApiKey } = useSettings();
  const config = AI_PROVIDERS[providerId];
  const [key, setKey] = useState(getApiKey(providerId));
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (key.trim()) {
      saveApiKey(providerId, key.trim());
      setSaved(true);
      toast.success(`${config.name} API key saved`);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleRemove = () => {
    removeApiKey(providerId);
    setKey('');
    toast.success(`${config.name} API key removed`);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted">{config.name} API Key</label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type={show ? 'text' : 'password'}
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder={`Enter ${config.name} API key...`}
            rightIcon={
              <button
                type="button"
                onClick={() => setShow(v => !v)}
                className="hover:text-white transition-colors"
              >
                {show ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            }
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleSave} className="shrink-0">
          {saved ? <Check size={14} className="text-green-400" /> : 'Save'}
        </Button>
        {getApiKey(providerId) && (
          <Button variant="danger" size="sm" onClick={handleRemove} className="shrink-0" iconOnly icon={<Trash2 size={14} />} />
        )}
      </div>
      <p className="text-[10px] text-muted/50">
        Stored locally in your browser. Never sent to our servers.
      </p>
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const {
    provider, setProvider,
    getModelForProvider, setModelForProvider,
    fontSize, setFontSize,
  } = useSettings();
  const { clearHistory } = useChat();
  const [clearModal, setClearModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);

  const handleClearHistory = async () => {
    await clearHistory();
    setClearModal(false);
    toast.success('Chat history cleared');
  };

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            to="/chat"
            className="p-2 rounded-xl text-muted hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Back to chat"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-base font-semibold text-white">Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Account */}
        <Section title="Account" icon={User}>
          <div className="flex items-center gap-4">
            <Avatar user={user} size="lg" />
            <div>
              <p className="font-semibold text-white">{user?.displayName || 'User'}</p>
              <p className="text-sm text-muted">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            icon={<LogOut size={14} />}
            onClick={() => setLogoutModal(true)}
          >
            Sign Out
          </Button>
        </Section>

        {/* AI Provider */}
        <Section title="AI Provider" icon={Cpu}>
          <p className="text-xs text-muted">
            Choose which AI provider to use. "Auto" tries Groq first, then OpenRouter as fallback.
          </p>
          <div className="space-y-2">
            {/* Auto mode */}
            <button
              onClick={() => setProvider('auto')}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 text-left ${
                provider === 'auto'
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-border hover:border-border/80 hover:bg-white/3'
              }`}
            >
              <span className="text-xl shrink-0">🤖</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">Auto (Recommended)</p>
                <p className="text-xs text-muted truncate">Try Groq first, fall back to OpenRouter</p>
              </div>
              {provider === 'auto' && <Check size={14} className="text-primary shrink-0" />}
            </button>
            {PROVIDER_ORDER.map(pid => (
              <ProviderCard key={pid} providerId={pid} isSelected={provider === pid} onSelect={setProvider} />
            ))}
          </div>
        </Section>

        {/* Model Selection */}
        <Section title="Model Selection" icon={Cpu}>
          {PROVIDER_ORDER.map(pid => {
            const config = AI_PROVIDERS[pid];
            const currentModel = getModelForProvider(pid);
            return (
              <div key={pid} className="space-y-2">
                <label className="text-xs font-medium text-muted">{config.name} Model</label>
                <div className="relative">
                  <select
                    value={currentModel}
                    onChange={e => setModelForProvider(pid, e.target.value)}
                    className="w-full appearance-none bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 cursor-pointer pr-10"
                  >
                    {config.models.map(m => (
                      <option key={m.id} value={m.id} className="bg-[#15151B]">
                        {m.name} — {m.description}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
              </div>
            );
          })}
        </Section>

        {/* API Keys */}
        <Section title="API Keys" icon={Key}>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            <span>API keys are stored locally in your browser and never sent to any server.</span>
          </div>
          {PROVIDER_ORDER.map(pid => (
            <ApiKeyField key={pid} providerId={pid} />
          ))}
        </Section>

        {/* Appearance */}
        <Section title="Appearance" icon={Palette}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Theme</p>
              <p className="text-xs text-muted mt-0.5">{isDark ? 'Dark mode active' : 'Light mode active'}</p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:border-primary/30 bg-card hover:bg-primary/5 text-sm text-white transition-all duration-200"
            >
              {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-primary" />}
              <span>{isDark ? 'Switch to Light' : 'Switch to Dark'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Font Size</p>
              <p className="text-xs text-muted mt-0.5">Adjust the message text size</p>
            </div>
            <div className="flex gap-1">
              {[{ v: 'sm', l: 'S' }, { v: 'md', l: 'M' }, { v: 'lg', l: 'L' }].map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => setFontSize(v)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium border transition-all duration-200 ${
                    fontSize === v
                      ? 'bg-primary/20 border-primary/50 text-white'
                      : 'border-border text-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Data */}
        <Section title="Data & Privacy" icon={Trash2}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Clear Chat History</p>
              <p className="text-xs text-muted mt-0.5">Permanently delete all your conversations</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={14} />}
              onClick={() => setClearModal(true)}
            >
              Clear All
            </Button>
          </div>
        </Section>

        {/* Version */}
        <p className="text-center text-xs text-muted/30 pb-4">
          FableMind Design AI · v1.0.0
        </p>
      </div>

      {/* Clear History Modal */}
      <Modal open={clearModal} onClose={() => setClearModal(false)} title="Clear Chat History">
        <p className="text-sm text-muted mb-5">
          This will permanently delete all your conversations. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setClearModal(false)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={handleClearHistory} icon={<Trash2 size={14} />}>
            Delete All
          </Button>
        </div>
      </Modal>

      {/* Logout Modal */}
      <Modal open={logoutModal} onClose={() => setLogoutModal(false)} title="Sign Out">
        <p className="text-sm text-muted mb-5">Are you sure you want to sign out?</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setLogoutModal(false)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={logout} icon={<LogOut size={14} />}>
            Sign Out
          </Button>
        </div>
      </Modal>
    </div>
  );
}
