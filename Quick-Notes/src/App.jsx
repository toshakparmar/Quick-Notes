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

// Add new Connection Status component
const ServerStatusBanner = ({ visible, onRetry, onDismiss }) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 
                   bg-red-600/90 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg 
                   flex items-center gap-3 text-white max-w-md w-full">
      <div className="flex-1">
        <p className="font-medium">Backend server connection error</p>
        <p className="text-xs text-red-100">The app is running in demo mode with limited functionality</p>
      </div>
      <button
        onClick={onRetry}
        className="px-3 py-1 bg-white text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
      >
        Retry
      </button>
      <button
        onClick={onDismiss}
        className="px-2 py-1 hover:bg-red-700/50 rounded-lg text-sm"
      >
        Dismiss
      </button>
    </div>
  );
};

const App = () => {
  const { user, loading, authError, refreshUser } = useAuth();
  const { notes, loading: notesLoading, error, createNote, updateNote, deleteNote } = useNotes();
  const { messages, sendMessage, loading: chatLoading } = useChat();
  const { toast, showToast, hideToast } = useToast();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [serverError, setServerError] = useState(false);
  const [dismissedError, setDismissedError] = useState(false);

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

  // Handle search from Navbar
  const handleSearch = (query, results = null) => {
    setSearchQuery(query);

    // If search results were provided from the backend, use them
    if (results) {
      setSearchResults(results);
    } else {
      // Otherwise clear search results to use client-side filtering
      setSearchResults(null);
    }
  };

  const filteredNotes = useMemo(() => {
    // If we have server-side search results, use those
    if (searchResults !== null) {
      return searchResults;
    }

    // Otherwise filter client-side
    if (!searchQuery.trim()) return notes;

    return notes.filter(note =>
      note.note.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [notes, searchQuery, searchResults]);

  // Single effect for server reconnection
  useEffect(() => {
    const handleServerReconnect = () => {
      // Instead of reloading, just refetch data
      window.location.reload();
    };

    window.addEventListener('vite:reconnect', handleServerReconnect);
    return () => window.removeEventListener('vite:reconnect', handleServerReconnect);
  }, []);

  // Handle server connection status
  useEffect(() => {
    if (error && error.includes('Network Error') && !dismissedError) {
      setServerError(true);
    } else {
      setServerError(false);
    }
  }, [error, dismissedError]);

  // Retry connection to server
  const handleRetryConnection = () => {
    window.location.reload();
  };

  // Dismiss server error banner
  const handleDismissError = () => {
    setDismissedError(true);
  };

  const handleError = (error) => {
    showToast(error.message || 'Something went wrong!', 'error');
  };

  const handleSuccess = (message) => {
    showToast(message, 'success');
  };

  // Handle Vite development server errors/reconnects
  useEffect(() => {
    const handleViteReconnect = () => {
      console.log('Vite server reconnected - reloading app state');

      // You might want to refresh data here instead of full reload
      // For example, refreshUser(), fetchNotes(), etc.

      // Alternatively, for a clean slate:
      // window.location.reload();
    };

    window.addEventListener('vite:reconnect', handleViteReconnect);

    // Add error boundary for uncaught HMR errors
    const originalOnError = window.onerror;
    window.onerror = function (message, source, lineno, colno, error) {
      // Check if this is a Vite HMR error
      if (message && (
        message.includes('Vite') ||
        message.includes('HMR') ||
        message.includes('The server is being restarted')
      )) {
        console.warn('Detected Vite HMR error:', message);
        // Don't reload immediately, let Vite handle recovery
        return true;
      }

      // Call the original handler for other errors
      return originalOnError ? originalOnError(message, source, lineno, colno, error) : false;
    };

    return () => {
      window.removeEventListener('vite:reconnect', handleViteReconnect);
      window.onerror = originalOnError;
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-zinc-900 text-white">
        <Navbar onSearch={handleSearch} />
        <Background />
        {user ? (
          <Foreground
            notes={filteredNotes} // Use filtered notes
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
            searchQuery={searchQuery} // Pass search query for highlighting
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
        {/* Add server connection status banner */}
        <ServerStatusBanner
          visible={serverError}
          onRetry={handleRetryConnection}
          onDismiss={handleDismissError}
        />
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