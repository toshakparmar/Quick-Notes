import React from 'react';
import { motion } from 'framer-motion';
import { IoIosClose } from 'react-icons/io';
import { FaRegEdit } from 'react-icons/fa';
import { MdOutlineFileDownload } from 'react-icons/md';
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';

const NoteCard = ({ note, dragConstraints, onDelete, onEdit, onView, onStatusChange, layoutId, custom }) => {
  const isCompleted = note.status === true;

  return (
    <motion.div
      layout
      layoutId={layoutId}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: 0.3,
          delay: custom * 0.05,
          ease: "easeOut"
        }
      }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      drag
      dragConstraints={dragConstraints}
      whileDrag={{ scale: 1.1, zIndex: 50 }}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
      className="w-[280px] xs:w-[200px] sm:w-[220px] md:w-[200px] lg:w-[220px]
                 h-[320px] xs:h-[240px] sm:h-[260px] md:h-[240px] lg:h-[260px]
                 rounded-[40px] bg-zinc-800/90 text-white
                 cursor-grab active:cursor-grabbing
                 hover:shadow-lg transition-shadow duration-200"
      onDoubleClick={() => onView(note)}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-3 xs:p-4">
          <div className="flex items-center gap-1.5 xs:gap-2">
            <HiOutlineClipboardDocumentList className="text-sm xs:text-base text-zinc-400" />
            <span className="text-xs xs:text-sm text-zinc-400">#{note.noteId}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note);
            }}
            className="w-5 h-5 xs:w-6 xs:h-6 rounded-full bg-zinc-700 hover:bg-zinc-600
                     flex items-center justify-center transition-colors"
          >
            <IoIosClose size="1.2em" color="#fff" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-3 xs:px-4 overflow-hidden">
          <p className="text-xs xs:text-sm leading-relaxed line-clamp-4
                       hover:line-clamp-none transition-all duration-200">
            {note.note}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto">
          <div className="flex items-center justify-between p-3 xs:p-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}
              className="w-7 h-7 xs:w-8 xs:h-8 rounded-full bg-zinc-700 hover:bg-zinc-600
                       flex items-center justify-center transition-colors"
            >
              <FaRegEdit size="0.8em" color="#fff" />
            </button>
            <button
              className="w-7 h-7 xs:w-8 xs:h-8 rounded-full bg-zinc-700 hover:bg-zinc-600
                       flex items-center justify-center transition-colors"
            >
              <MdOutlineFileDownload size="0.9em" color="#fff" />
            </button>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Pass the current status to toggle
              onStatusChange(note._id, note.status);
            }}
            className={`w-full p-2 text-sm font-medium transition-colors duration-200 rounded-b-[40px]
                       ${note.status
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {note.status ? 'Completed' : 'Pending'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NoteCard;