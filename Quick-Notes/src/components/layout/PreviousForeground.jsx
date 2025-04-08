import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdAdd } from 'react-icons/io';
import { FaRobot, FaArrowUp } from 'react-icons/fa';
import { IoIosClose } from "react-icons/io";
import { useNotes } from '../../hooks/useNotes';
import { useChat } from '../../hooks/useChat';
import NoteCard from '../notes/NoteCard';
import NoteModal from '../modals/NoteModal';
import DeleteModal from '../modals/DeleteModal';
import ViewModal from '../modals/ViewModal';
import Toast from '../ui/Toast';

const Foreground = () => {
    const ref = useRef(null);
    const chatContainerRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [toast, setToast] = useState(null);
    const [assistantQuery, setAssistantQuery] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [assistantLoading, setAssistantLoading] = useState(false);
    const { notes, loading, createNote, updateNote, deleteNote, updateNoteStatus } = useNotes();
    const { openChat } = useChat();

    // Update backdrop blur effect
    const backdropClass = React.useMemo(() => {
        if (isModalOpen || isDeleteModalOpen || isViewModalOpen || isChatOpen) {
            return "relative filter blur-sm transition-all duration-300 pointer-events-none";
        }
        return "relative transition-all duration-300";
    }, [isModalOpen, isDeleteModalOpen, isViewModalOpen, isChatOpen]);

    // Handle note operations
    const handleCreateNote = async (noteContent) => {
        try {
            await createNote(noteContent);
            setToast({ message: 'Note created successfully!', type: 'success' });
        } catch (error) {
            setToast({ message: error.message, type: 'error' });
        }
    };

    const handleUpdateNote = async (id, noteContent) => {
        try {
            await updateNote(id, noteContent);
            setToast({ message: 'Note updated successfully!', type: 'success' });
        } catch (error) {
            setToast({ message: error.message, type: 'error' });
        }
    };

    const handleDeleteNote = async () => {
        try {
            await deleteNote(selectedNote._id);
            setIsDeleteModalOpen(false);
            setSelectedNote(null);
            setToast({ message: 'Note deleted successfully!', type: 'success' });
        } catch (error) {
            setToast({ message: error.message, type: 'error' });
        }
    };

    // Chat handlers
    const toggleChat = () => {
        setIsChatOpen(prev => !prev);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!assistantQuery.trim() || assistantLoading) return;

        const userMessage = {
            type: 'user',
            content: assistantQuery,
            timestamp: new Date()
        };

        setChatMessages(prev => [...prev, userMessage]);
        setAssistantQuery('');
        setAssistantLoading(true);

        try {
            const response = await fetch('/api/assistant', {
                method: 'POST',
                body: JSON.stringify({ message: assistantQuery }),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();
            const assistantMessage = {
                type: 'assistant',
                content: data.message,
                timestamp: new Date()
            };

            setChatMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            setChatMessages(prev => [...prev, {
                type: 'error',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            }]);
        } finally {
            setAssistantLoading(false);
        }
    };

    return (
        <div className="fixed w-full h-full z-[3] bg-zinc-900/20">
            {/* Main content with blur effect */}
            <div className={backdropClass}>
                <div ref={ref} className="w-full min-h-screen p-5">
                    <div className="flex flex-wrap gap-10">
                        <AnimatePresence>
                            {notes.map((note) => (
                                <NoteCard
                                    key={note._id}
                                    note={note}
                                    dragConstraints={ref}
                                    onDelete={(note) => {
                                        setSelectedNote(note);
                                        setIsDeleteModalOpen(true);
                                    }}
                                    onEdit={(note) => {
                                        setSelectedNote(note);
                                        setIsModalOpen(true);
                                    }}
                                    onView={(note) => {
                                        setSelectedNote(note);
                                        setIsViewModalOpen(true);
                                    }}
                                    onStatusChange={updateNoteStatus}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={`fixed bottom-4 right-4 md:right-8 flex flex-row space-x-4 z-20 ${isModalOpen || isDeleteModalOpen || isViewModalOpen ? 'pointer-events-none opacity-50' : ''
                    }`}>
                    <div className="group relative">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsModalOpen(true)}
                            className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:opacity-90 transition-opacity"
                        >
                            <IoMdAdd size="1.5em" />
                        </motion.button>
                        <div className="absolute right-1/2 translate-x-1/2 -top-12 px-2 py-1 bg-zinc-800 text-zinc-200 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Add New Note
                        </div>
                    </div>

                    <div className="group relative">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleChat}
                            className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:opacity-90 transition-opacity"
                        >
                            {isChatOpen ? <IoIosClose size="1.5em" /> : <FaRobot size="1.5em" />}
                        </motion.button>
                        <div className="absolute right-1/2 translate-x-1/2 -top-12 px-2 py-1 bg-zinc-800 text-zinc-200 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {isChatOpen ? 'Close Assistant' : 'Quick Assistant'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Modal */}
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 w-full md:w-[500px] lg:w-[700px] mx-auto z-30"
                    >
                        <div className="bg-zinc-800/95 rounded-t-2xl shadow-lg overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <h3 className="text-zinc-200 font-medium">Quick Notes Assistant</h3>
                                </div>
                                <button
                                    onClick={toggleChat}
                                    className="p-2 hover:bg-zinc-700 rounded-full transition-colors"
                                >
                                    <IoIosClose size="1.5em" color="#fff" />
                                </button>
                            </div>

                            <div
                                ref={chatContainerRef}
                                className="h-[400px] max-h-[60vh] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent"
                            >
                                {chatMessages.map((message, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[80%] p-3 rounded-2xl ${message.type === 'user'
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : message.type === 'error'
                                                    ? 'bg-red-500/10 text-red-200 rounded-tl-none'
                                                    : 'bg-zinc-700 text-zinc-200 rounded-tl-none'
                                            }`}>
                                            <div className="text-sm whitespace-pre-wrap break-words">
                                                {message.content}
                                            </div>
                                            <span className="text-xs opacity-50 mt-1 block">
                                                {new Date(message.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}

                                {assistantLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-start"
                                    >
                                        <div className="bg-zinc-700 text-zinc-200 p-3 rounded-2xl rounded-tl-none">
                                            <div className="flex space-x-2">
                                                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-100"></div>
                                                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-200"></div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <div className="p-4 border-t border-zinc-700">
                                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                                    <textarea
                                        placeholder="Ask me anything about your notes..."
                                        className="flex-1 p-3 h-12 max-h-32 resize-none bg-zinc-700 rounded-xl text-zinc-200 outline-none placeholder-zinc-400"
                                        value={assistantQuery}
                                        onChange={(e) => setAssistantQuery(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        disabled={assistantLoading || !assistantQuery.trim()}
                                    >
                                        {assistantLoading ? (
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <FaArrowUp size="1.2em" />
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modals - Outside of blur container */}
            <div className="relative z-30">
                <AnimatePresence>
                    {isModalOpen && (
                        <NoteModal
                            isOpen={isModalOpen}
                            onClose={() => {
                                setIsModalOpen(false);
                                setSelectedNote(null);
                            }}
                            note={selectedNote}
                            onSave={(noteContent) => {
                                if (selectedNote) {
                                    handleUpdateNote(selectedNote._id, noteContent);
                                } else {
                                    handleCreateNote(noteContent);
                                }
                                setIsModalOpen(false);
                                setSelectedNote(null);
                            }}
                        />
                    )}

                    {isDeleteModalOpen && (
                        <DeleteModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => {
                                setIsDeleteModalOpen(false);
                                setSelectedNote(null);
                            }}
                            onConfirm={handleDeleteNote}
                        />
                    )}

                    {isViewModalOpen && (
                        <ViewModal
                            isOpen={isViewModalOpen}
                            onClose={() => {
                                setIsViewModalOpen(false);
                                setSelectedNote(null);
                            }}
                            note={selectedNote}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Toast - Always on top */}
            <AnimatePresence>
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Foreground;