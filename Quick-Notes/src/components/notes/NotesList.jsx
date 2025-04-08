import React from 'react';
import { AnimatePresence } from 'framer-motion';
import NoteCard from './NoteCard';

const NotesList = ({ notes, onDelete, onEdit, onView, onStatusChange }) => {
  return (
    <div className="z-[3] w-full h-full flex flex-wrap gap-4 p-2">
      <AnimatePresence>
        {notes.map((note) => (
          <NoteCard
            key={note._id}
            note={note}
            onDelete={onDelete}
            onEdit={onEdit}
            onView={onView}
            onStatusChange={onStatusChange}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotesList;