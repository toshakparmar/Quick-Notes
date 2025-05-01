import React, { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNotes } from '../../../hooks/useNotes';
import { useChat } from '../../../hooks/useChat';
import NotesArea from './NotesArea';
import ActionButtons from './ActionButtons';
import ChatWindow from './ChatWindow';
import ModalsContainer from './ModalsContainer';
import ViewModal from '../../modals/ViewModal';
import Toast from '../../ui/Toast';
import { useToast } from '../../../hooks/useToast';

const Foreground = () => {
    const ref = useRef(null);
    const { notes, createNote, updateNote, deleteNote, updateNoteStatus, fetchNotes, loading: notesLoading } = useNotes();
    const { messages, sendMessage, loading: chatLoading } = useChat();
    const { toast, showToast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    // Modal States
    const [modalStates, setModalStates] = useState({
        isNoteOpen: false,
        isDeleteOpen: false,
        isViewOpen: false,
        isChatOpen: false
    });
    const [selectedNote, setSelectedNote] = useState(null);

    // Compute backdrop blur effect
    const backdropClass = React.useMemo(() => {
        const isAnyModalOpen = Object.values(modalStates).some(Boolean);
        return isAnyModalOpen
            ? "relative filter blur-sm transition-all duration-300 pointer-events-none"
            : "relative transition-all duration-300";
    }, [modalStates]);

    // Modified Modal Handlers
    const handleModal = (modalType, isOpen, note = null) => {
        if (modalType === 'isChatOpen') {
            // Close other modals when opening chat
            setModalStates(prev => ({
                ...prev,
                isNoteOpen: false,
                isDeleteOpen: false,
                isViewOpen: false,
                [modalType]: isOpen
            }));
        } else {
            setModalStates(prev => ({ ...prev, [modalType]: isOpen }));
        }
        if (note !== undefined) setSelectedNote(isOpen ? note : null);
    };

    // Note Operations with Refresh
    const handleNoteOperation = async (operation, ...args) => {
        try {
            setIsProcessing(true);

            // First set optimistic UI updates
            const operationType = operation.name;

            // Execute the actual operation
            const result = await operation(...args);

            let operationName = "";
            switch (operationType) {
                case "createNote":
                    operationName = "Created";
                    break;
                case "updateNote":
                    operationName = "Updated";
                    break;
                case "deleteNote":
                    operationName = "Deleted";
                    break;
                case "updateNoteStatus":
                    operationName = "Status Updated";
                    break;
                default:
                    operationName = "Operation completed";
            }

            showToast(`Note ${operationName} successfully!`, 'success');

            // Only refresh notes if not already done by the operation
            if (operationType !== 'updateNoteStatus') {
                await fetchNotes();
            }

            return result;
        } catch (error) {
            console.error('Operation failed:', error);
            showToast(error.message || 'Operation failed!', 'error');
            throw error; // Re-throw to allow further handling
        } finally {
            setIsProcessing(false);
        }
    };

    // Add status update handler
    const handleStatusUpdate = async (noteId, currentStatus) => {
        try {
            const result = await handleNoteOperation(updateNoteStatus, noteId, !currentStatus);
            // No need to manually show success toast or fetch notes - 
            // handleNoteOperation already takes care of these steps
        } catch (error) {
            console.error('Status update error:', error);
            // Error toast already shown by handleNoteOperation
        }
    };

    // Modified sendMessage handler
    const handleSendMessage = async (message) => {
        await sendMessage(message);
        await fetchNotes();
    };

    return (
        <div className="fixed w-full h-full z-[3] bg-zinc-900/20">
            {/* Show loading indicator if any loading is happening */}
            {(notesLoading || chatLoading || isProcessing) && (
                <div className="fixed top-4 right-4 z-50">
                    <div className="px-4 py-2 bg-zinc-800 rounded-xl shadow-lg flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-zinc-300">Loading...</span>
                    </div>
                </div>
            )}

            <div className={backdropClass}>
                <div className="w-full h-screen flex">
                    <NotesArea
                        ref={ref}
                        notes={notes}
                        onNoteAction={handleModal}
                        onStatusChange={handleStatusUpdate}
                    />
                </div>

                <div className="fixed bottom-0 w-full px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
                    <ActionButtons
                        modalStates={modalStates}
                        onActionClick={handleModal}
                    />
                </div>
            </div>

            <AnimatePresence>
                {modalStates.isChatOpen && (
                    <ChatWindow
                        isOpen={modalStates.isChatOpen}
                        onClose={() => handleModal('isChatOpen', false)}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        loading={chatLoading} // Fix: use chatLoading instead of loading
                        onOperationComplete={fetchNotes}
                        onConfirm={(value) => handleNoteOperation(value)}
                        onCancel={() => handleModal('isChatOpen', false)}
                        onUpdateNote={(content) => handleNoteOperation(updateNote, selectedNote?._id, content)}
                    />
                )}
            </AnimatePresence>

            <ModalsContainer
                modalStates={modalStates}
                selectedNote={selectedNote}
                onClose={handleModal}
                onNoteCreate={(content) => handleNoteOperation(createNote, content)}
                onNoteUpdate={(id, content) => handleNoteOperation(updateNote, id, content)}
                onNoteDelete={() => handleNoteOperation(deleteNote, selectedNote._id)}
            />

            {modalStates.isViewOpen && (
                <ViewModal
                    isOpen={modalStates.isViewOpen}
                    onClose={() => handleModal('isViewOpen', false)}
                    note={selectedNote}
                    showToast={showToast}
                />
            )}

            <AnimatePresence>
                {toast && <Toast {...toast} />}
            </AnimatePresence>
        </div>
    );
};

export default Foreground;