import React, { useState, useRef, useEffect } from 'react';
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
import { use } from 'react';

const Foreground = () => {
    const ref = useRef(null);
    const { notes, createNote, updateNote, deleteNote, getNoteById, updateNoteStatus, fetchNotes } = useNotes();
    const { messages, sendMessage, loading } = useChat();
    const { toast, showToast } = useToast();

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
            await operation(...args);
            let operationName = "";

            switch (operation.name) {
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
            await fetchNotes(); // Refresh notes after operation

        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    // Add status update handler
    const handleStatusUpdate = async (noteId, currentStatus) => {
        try {
            await handleNoteOperation(updateNoteStatus, noteId, !currentStatus);
            showToast('Note status updated successfully!', 'success');
        } catch (error) {
            console.error('Status update error:', error);
            showToast(error.message || 'Failed to update status', 'error');
        }
    };

    // Modified sendMessage handler
    const handleSendMessage = async (message) => {
        await sendMessage(message);
        await fetchNotes(); // Refresh notes after assistant interaction
    };

    return (
        <div className="fixed w-full h-full z-[3] bg-zinc-900/20">
            <div className={backdropClass}>
                <div className="w-full h-screen flex">
                    <NotesArea
                        ref={ref}
                        notes={notes}
                        onNoteAction={handleModal}
                        onStatusChange={handleStatusUpdate}  // Updated this line
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
                        loading={loading}
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