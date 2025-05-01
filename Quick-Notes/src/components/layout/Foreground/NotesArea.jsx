import React, { forwardRef, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import NoteCard from '../../notes/NoteCard';
import useWindowSize from '../../../hooks/useWindowSize';

const NotesArea = forwardRef(({ notes, onNoteAction, onStatusChange, searchQuery = '' }, ref) => {
    const { width } = useWindowSize();
    const [key, setKey] = useState(0);
    const [previousNotes, setPreviousNotes] = useState([]);

    useEffect(() => {
        setKey(prev => prev + 1);
    }, [width]);

    // Update when notes change to enable proper animation
    useEffect(() => {
        setPreviousNotes(notes);
    }, [notes]);

    const highlightSearchTerm = (text, searchTerm) => {
        if (!searchTerm) return text;

        // Create a highlighted version of text with search term in bold
        const parts = String(text).split(new RegExp(`(${searchTerm})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === searchTerm.toLowerCase()
                ? <mark key={index} className="bg-blue-500/30 text-white px-0.5 rounded">{part}</mark>
                : part
        );
    };

    return (
        <div
            className="w-full h-full mx-auto overflow-y-scroll -mt-1
                      scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800/50
                      hover:scrollbar-thumb-zinc-500">
            <div ref={ref}
                className="grid auto-rows-max
                           grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6
                           gap-2 xs:gap-3
                           place-items-center
                           px-1 sm:px-2 py-1">
                <AnimatePresence mode="sync" key={key}>
                    {notes.length > 0 ? (
                        notes.map((note, index) => (
                            <NoteCard
                                key={`${note._id}-${key}`}
                                note={note}
                                highlightedContent={searchQuery ? highlightSearchTerm(note.note, searchQuery) : null}
                                dragConstraints={ref}
                                onDelete={() => onNoteAction('isDeleteOpen', true, note)}
                                onEdit={() => onNoteAction('isNoteOpen', true, note)}
                                onView={() => onNoteAction('isViewOpen', true, note)}
                                onStatusChange={onStatusChange}
                                layoutId={`note-${note._id}-${key}`}
                                custom={index}
                            />
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="col-span-full text-center py-16"
                        >
                            <div className="text-zinc-400 text-lg">
                                {searchQuery
                                    ? `No notes found matching "${searchQuery}"`
                                    : "No notes yet. Create your first note!"}
                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 
                                          rounded-xl text-white font-medium w-64"
                                    onClick={() => onNoteAction('isNoteOpen', true)}
                                >
                                    Create Note
                                </motion.button>

                                <motion.button
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: "0 0 15px rgba(79, 209, 197, 0.5)"
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 
                                            hover:from-blue-600 hover:to-cyan-600
                                            rounded-xl text-white font-medium flex items-center gap-2
                                            border border-cyan-400/20 shadow-lg shadow-cyan-500/20 w-64"
                                    onClick={() => onNoteAction('isChatOpen', true)}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12"
                                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M20 4L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M14 4H20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Create with AI Assistant
                                </motion.button>
                            </div>
                            <p className="text-zinc-500 text-xs mt-4">
                                The AI Assistant can help you create notes based on natural language input
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
});

export default NotesArea;