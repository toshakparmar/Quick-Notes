import React from 'react';
import { motion } from 'framer-motion';

const ActionButton = ({ icon: Icon, onClick, className, tooltip, active }) => {
  return (
    <div className="relative group">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 
                    ${className} ${active ? 'ring-2 ring-white ring-opacity-50' : ''}`}
      >
        <Icon size="1.5em" color="white" />
      </motion.button>
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-zinc-800 text-white text-sm px-3 py-1.5 rounded-lg 
                        whitespace-nowrap shadow-lg relative">
            {tooltip}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 
                            border-4 border-transparent border-t-zinc-800"/>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionButton;