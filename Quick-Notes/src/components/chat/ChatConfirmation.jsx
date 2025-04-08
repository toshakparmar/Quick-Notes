import React from 'react';
import { motion } from 'framer-motion';

const ChatConfirmation = ({ type, message, onConfirm, onCancel }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-zinc-800 p-3 sm:p-4 rounded-xl mb-2 sm:mb-4"
        >
            <p className="text-white text-xs sm:text-sm md:text-base mb-3 sm:mb-4">
                {message}
            </p>
            <div className="flex justify-end space-x-2 sm:space-x-3">
                <button
                    onClick={onCancel}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm 
                             bg-zinc-600 text-white rounded-xl hover:bg-zinc-700 
                             transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm 
                             bg-red-600 text-white rounded-xl hover:bg-red-700 
                             transition-colors"
                >
                    Confirm
                </button>
            </div>
        </motion.div>
    );
};

export default ChatConfirmation;