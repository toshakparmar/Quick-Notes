import React, { forwardRef, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import NoteCard from '../../notes/NoteCard';
import useWindowSize from '../../../hooks/useWindowSize';

const NotesArea = forwardRef(({ notes, onNoteAction, onStatusChange }, ref) => {
    const { width } = useWindowSize();
    const [key, setKey] = useState(0);

    useEffect(() => {
        setKey(prev => prev + 1);
    }, [width]);

    return (
        <div ref={ref}
            className="w-full h-full mx-auto overflow-y-scroll
                        scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800/50
                        hover:scrollbar-thumb-zinc-500">
            <div className="grid auto-rows-max
                          grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6
                          gap-2 xs:gap-3 sm:gap-4 md:gap-5
                          place-items-center
                          p-2 xs:p-3 sm:p-4">
                <AnimatePresence mode="sync" key={key}>
                    {notes.map((note, index) => (
                        <NoteCard
                            key={`${note._id}-${key}`}
                            note={note}
                            dragConstraints={ref}
                            onDelete={() => onNoteAction('isDeleteOpen', true, note)}
                            onEdit={() => onNoteAction('isNoteOpen', true, note)}
                            onView={() => onNoteAction('isViewOpen', true, note)}
                            onStatusChange={onStatusChange}
                            layoutId={`note-${note._id}-${key}`}
                            custom={index}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
});

export default NotesArea;