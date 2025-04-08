import React from 'react';
import { IoIosClose } from 'react-icons/io';

const ChatHeader = ({ onClose }) => {
    return (
        <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-b border-zinc-700">
            <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <h3 className="text-zinc-200 text-sm sm:text-base md:text-lg font-medium">
                    Quick Notes Assistant
                </h3>
            </div>
            <button
                onClick={onClose}
                className="p-1 sm:p-2 hover:bg-zinc-700 rounded-full transition-colors"
            >
                <IoIosClose className="w-5 h-5 sm:w-6 sm:h-6" color="#fff" />
            </button>
        </div>
    );
};

export default ChatHeader;