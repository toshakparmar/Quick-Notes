import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Background from './components/layout/Background';
import Foreground from './components/layout/Foreground/index.jsx';
import Toast from './components/ui/Toast';
import { useNotes } from './hooks/useNotes';
import { useChat } from './hooks/useChat';
import { useToast } from './hooks/useToast';

const App = () => {
  const { notes, loading, error, createNote, updateNote, deleteNote } = useNotes();
  const { messages, sendMessage, loading: chatLoading } = useChat();
  const { toast, showToast, hideToast } = useToast();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleError = (error) => {
    showToast(error.message || 'Something went wrong!', 'error');
  };

  const handleSuccess = (message) => {
    showToast(message, 'success');
  };

  return (
    <div className="relative w-full h-screen bg-zinc-800">
      <Background />
      
      <Foreground
        notes={notes}
        loading={loading}
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
      
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;