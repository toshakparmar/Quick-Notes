import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ChatHeader from '../../chat/ChatHeader';
import ChatMessages from '../../chat/ChatMessages';
import ChatInput from '../../chat/ChatInput';

const ChatWindow = ({ isOpen, onClose, messages, onSendMessage, loading }) => {
    const [inputValue, setInputValue] = useState('');
    const chatContainerRef = useRef(null);

    // Handle initial open and messages update
    useEffect(() => {
        if (isOpen && chatContainerRef.current) {
            const element = chatContainerRef.current;
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
                element.scrollTop = element.scrollHeight;
            });
        }
    }, [isOpen, messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (inputValue.trim() && !loading) {
            await onSendMessage(inputValue);
            setInputValue('');
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 w-full md:w-[600px] lg:w-[800px] mx-auto z-30"
        >
            <div className="bg-zinc-800 rounded-t-2xl shadow-lg overflow-hidden flex flex-col h-[600px]">
                <ChatHeader onClose={onClose} />
                <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-800"
                >
                    <ChatMessages messages={messages} loading={loading} />
                </div>
                <ChatInput
                    value={inputValue}
                    onChange={setInputValue}
                    onSubmit={handleSubmit}
                    loading={loading}
                />
            </div>
        </motion.div>
    );
};

export default ChatWindow;