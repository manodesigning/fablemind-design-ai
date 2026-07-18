import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllUsers, getAllFeedbacks } from '../services/firebaseService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function formatDate(timestamp) {
  if (!timestamp) return 'Never';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit'
  }).format(date);
}

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/chat');
      return;
    }
    
    const loadData = async () => {
      try {
        const [usersData, feedbacksData] = await Promise.all([
          getAllUsers(),
          getAllFeedbacks()
        ]);
        setUsers(usersData);
        setFeedbacks(feedbacksData);
      } catch (err) {
        console.error("Error loading admin data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted">Welcome back, Administrator.</p>
          </div>
          <button
            onClick={() => navigate('/chat')}
            className="px-4 py-2 bg-surface hover:bg-surface-hover rounded-xl text-sm font-medium transition-colors"
          >
            Back to App
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-surface p-1 rounded-xl w-fit">
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'users' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setTab('feedback')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'feedback' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-foreground'
            }`}
          >
            Feedback ({feedbacks.length})
          </button>
        </div>

        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            {tab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="overflow-x-auto"
              >
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-surface-hover/50">
                      <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Email</th>
                      <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Name</th>
                      <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Total Usage</th>
                      <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Last Login</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted">No users found</td>
                      </tr>
                    ) : users.map(u => (
                      <tr key={u.id} className="hover:bg-surface-hover/30 transition-colors">
                        <td className="p-4 text-sm font-medium">{u.email}</td>
                        <td className="p-4 text-sm text-muted">{u.displayName || '-'}</td>
                        <td className="p-4 text-sm">
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                            {u.totalMessages || 0} msgs
                          </span>
                        </td>
                        <td className="p-4 text-sm text-muted">{formatDate(u.lastLogin)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {tab === 'feedback' && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 space-y-4"
              >
                {feedbacks.length === 0 ? (
                  <div className="text-center text-muted py-8">No feedback submitted yet.</div>
                ) : feedbacks.map(f => (
                  <div key={f.id} className="p-4 rounded-xl border border-border bg-background">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-sm text-primary">{f.userEmail}</div>
                      <div className="text-xs text-muted">{formatDate(f.createdAt)}</div>
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{f.text}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
