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
      exit={{
        opacity: 0,
        scale: 0.8,
        transition: {
          duration: 0.2
        }
      }}
      drag
      dragConstraints={dragConstraints}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      whileDrag={{ scale: 1.1, zIndex: 50 }}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
      className="w-[280px] xs:w-[200px] sm:w-[220px] md:w-[200px] lg:w-[220px]
                 h-[320px] xs:h-[240px] sm:h-[260px] md:h-[240px] lg:h-[260px]
                 rounded-[40px] bg-zinc-800/90 text-white relative
                 cursor-grab active:cursor-grabbing hover:cursor-pointer
                 hover:shadow-lg transition-shadow duration-200"
      onDoubleClick={() => onView(note)}
    >
      {/* Add note number badge */}
      <div className="absolute -left-1 -top-1 bg-blue-600 text-white text-xs font-medium
                    px-2 py-1 rounded-full shadow-md z-10">
        #{note.noteId}
      </div>

      <div className="flex flex-col h-full">
        {/* Header - removed noteId from here since we have the badge */}
        <div className="flex items-center justify-between p-3 xs:p-4">
          <div className="flex items-center gap-1.5 xs:gap-2">
            <HiOutlineClipboardDocumentList className="text-sm xs:text-base text-zinc-400" />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note);
            }}
            className="w-5 h-5 xs:w-6 xs:h-6 rounded-full bg-zinc-700 hover:bg-zinc-600
                     flex items-center justify-center transition-colors
                     hover:bg-red-600 hover:shadow-md hover:shadow-red-500/20"
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
                       flex items-center justify-center transition-colors
                       hover:bg-blue-600 hover:shadow-md hover:shadow-blue-500/20"
            >
              <FaRegEdit size="0.8em" color="#fff" />
            </button>
            <button
              className="w-7 h-7 xs:w-8 xs:h-8 rounded-full bg-zinc-700 hover:bg-zinc-600
                       flex items-center justify-center transition-colors
                       hover:bg-blue-600 hover:shadow-md hover:shadow-blue-500/20"
              onClick={(e) => {
                e.stopPropagation();
                onView(note);
              }}
            >
              <MdOutlineFileDownload size="0.9em" color="#fff" />
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={(e) => {
              e.stopPropagation();
              // Pass the current status to toggle
              onStatusChange(note._id, note.status);
            }}
            className={`w-full p-2 text-sm font-medium transition-colors duration-300 rounded-b-[40px]
                       ${note.status
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {note.status ? 'Completed' : 'Pending'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default NoteCard;