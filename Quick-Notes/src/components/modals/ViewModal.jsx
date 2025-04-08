import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IoIosClose } from 'react-icons/io';
import { FaRegCopy, FaCheck } from 'react-icons/fa';

const ViewModal = ({ isOpen, onClose, note, showToast }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(note?.note);
      setIsCopied(true);
      showToast('Note copied to clipboard!', 'success');

      // Reset copy icon after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      showToast('Failed to copy note', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 w-full md:w-[500px] lg:w-[700px] mx-auto z-20"
    >
      <div className="bg-zinc-800/95 rounded-t-2xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex items-center space-x-2">
              <h3 className="text-zinc-200 font-medium">View Note</h3>
              <span className="text-xs text-zinc-400">#{note?.noteId}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-700 rounded-full transition-colors"
          >
            <IoIosClose size="1.5em" color="#fff" />
          </button>
        </div>

        <div className="p-4">
          <div className="bg-zinc-700 rounded-xl p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
            <p className="text-zinc-200 whitespace-pre-wrap break-words">
              {note?.note}
            </p>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={handleCopy}
              className={`px-4 py-2 ${isCopied ? 'bg-green-600' : 'bg-zinc-600'
                } text-zinc-200 rounded-full hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2`}
            >
              {isCopied ? (
                <>
                  <FaCheck size="1em" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <FaRegCopy size="1em" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-600 text-zinc-200 rounded-full hover:bg-zinc-700 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ViewModal;