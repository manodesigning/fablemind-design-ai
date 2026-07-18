import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Chrome, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
      // PublicRoute in App.jsx will automatically handle navigation 
      // to /admin or /chat once the user object is set.
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.1 }}
            className="w-24 h-24 flex items-center justify-center mb-4"
          >
            <img src="/logo-brain.png" alt="FableMind Brain" className="w-full h-full object-contain drop-shadow-2xl" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <img src="/logo-text.png" alt="FableMind Design AI" className="h-8 mb-2 object-contain" />
            <p className="text-sm text-muted">Your AI design partner</p>
          </motion.div>
        </div>

        {/* Card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            {['login', 'signup'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-3.5 text-sm font-medium transition-all duration-200 ${
                  tab === t
                    ? 'text-white border-b-2 border-primary'
                    : 'text-muted hover:text-white/70'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.form
                key={tab}
                initial={{ opacity: 0, x: tab === 'login' ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: tab === 'login' ? 10 : -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {tab === 'signup' && (
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    leftIcon={<User size={14} />}
                    autoComplete="name"
                    required
                  />
                )}
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  leftIcon={<Mail size={14} />}
                  autoComplete="email"
                  required
                />
                <Input
                  label="Password"
                  type={showPw ? 'text' : 'password'}
                  placeholder={tab === 'signup' ? 'At least 6 characters' : 'Your password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  leftIcon={<Lock size={14} />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="hover:text-white transition-colors"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  }
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  required
                />

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
                  >
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={loading}
                >
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                </Button>
              </motion.form>
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-xs text-muted/50 mt-4">
          By continuing, you agree to our Terms of Service & Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}

function friendlyError(code) {
  const messages = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account already exists with this email.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/popup-blocked': 'Popup was blocked. Please allow popups for this site.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled. Please try again.',
    'auth/invalid-credential': 'Invalid credentials. Please check and try again.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/unauthorized-domain': 'This domain is not authorized in Firebase. Please contact support.',
    'auth/operation-not-allowed': 'Google sign-in is not enabled. Please contact support.',
    'auth/internal-error': 'An internal error occurred. Please try again.',
    'auth/invalid-continue-uri': 'Invalid redirect URL. Please try refreshing the page.',
  };
  return messages[code] || `Something went wrong (${code || 'unknown'}). Please try again.`;
}
