import React from 'react';
import { motion } from 'framer-motion';
import { IoIosClose } from 'react-icons/io';

const BaseModal = ({ 
    isOpen, 
    onClose, 
    title, 
    indicatorColor = 'blue', 
    children 
}) => {
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
                        <div className={`w-2 h-2 bg-${indicatorColor}-500 rounded-full`}></div>
                        <h3 className="text-zinc-200 font-medium">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-700 rounded-full transition-colors"
                    >
                        <IoIosClose size="1.5em" color="#fff" />
                    </button>
                </div>
                {children}
            </div>
        </motion.div>
    );
};

export default BaseModal;