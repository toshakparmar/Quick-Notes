import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion'; // Fix: Add motion import
import Background from './components/layout/Background';
import Foreground from './components/layout/Foreground/index.jsx';
import Toast from './components/ui/Toast';
import { useNotes } from './hooks/useNotes';
import { useChat } from './hooks/useChat';
import { useToast } from './hooks/useToast';
import { useAuth } from './contexts/AuthContext.jsx';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl mb-4">Something went wrong</h1>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 rounded-xl hover:bg-blue-700"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  const { user, loading, authError, refreshUser } = useAuth();
  const { notes, loading: notesLoading, error, createNote, updateNote, deleteNote } = useNotes();
  const { messages, sendMessage, loading: chatLoading } = useChat();
  const { toast, showToast, hideToast } = useToast();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Show auth errors
  useEffect(() => {
    if (authError) {
      showToast(authError, 'error');
    }
  }, [authError, showToast]);

  // Re-verify auth when the app loads
  useEffect(() => {
    // Only run once when component mounts
    const lastRefresh = sessionStorage.getItem('lastAuthRefresh');
    const now = Date.now();

    // Only refresh if it's been more than 5 minutes
    if (!lastRefresh || now - parseInt(lastRefresh) > 5 * 60 * 1000) {
      refreshUser();
      sessionStorage.setItem('lastAuthRefresh', now.toString());
    }

    // Handle page visibility changes (e.g., when user returns to the tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const lastVisibilityRefresh = sessionStorage.getItem('lastVisibilityRefresh');
        const currentTime = Date.now();

        // Only refresh if it's been more than 2 minutes since last visibility refresh
        if (!lastVisibilityRefresh || currentTime - parseInt(lastVisibilityRefresh) > 2 * 60 * 1000) {
          refreshUser();
          sessionStorage.setItem('lastVisibilityRefresh', currentTime.toString());
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshUser]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    return notes.filter(note =>
      note.note.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [notes, searchQuery]);

  // Single effect for server reconnection
  useEffect(() => {
    const handleServerReconnect = () => {
      // Instead of reloading, just refetch data
      window.location.reload();
    };

    window.addEventListener('vite:reconnect', handleServerReconnect);
    return () => window.removeEventListener('vite:reconnect', handleServerReconnect);
  }, []);

  const handleError = (error) => {
    showToast(error.message || 'Something went wrong!', 'error');
  };

  const handleSuccess = (message) => {
    showToast(message, 'success');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-zinc-900 text-white">
        <Navbar onSearch={setSearchQuery} />
        <Background />
        {user ? (
          <Foreground
            notes={filteredNotes}
            loading={notesLoading}
            onCreateNote={async (note) => {
              try {
                await createNote(note);
                handleSuccess('Note created successfully!');
              } catch (error) {
                handleError(error);
              }
            }}
            onUpdateNote={async (id, note) => {
              try {
                await updateNote(id, note);
                handleSuccess('Note updated successfully!');
              } catch (error) {
                handleError(error);
              }
            }}
            onDeleteNote={async (id) => {
              try {
                await deleteNote(id);
                handleSuccess('Note deleted successfully!');
              } catch (error) {
                handleError(error);
              }
            }}
            onOpenChat={() => setIsChatOpen(true)}
          />
        ) : (
          <div className="h-[80vh] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center px-4"
            >
              <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r 
                               from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Welcome to Quick Notes
              </h1>
              <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                Sign in to manage your notes and access all features.
              </p>
            </motion.div>
          </div>
        )}
      </div>
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
};

export default App;