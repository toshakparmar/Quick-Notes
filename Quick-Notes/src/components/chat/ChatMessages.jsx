import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaEdit, FaTrash, FaToggleOn } from 'react-icons/fa';

const MessageIcon = ({ type }) => {
    switch (type) {
        case 'create':
            return <FaCheck className="text-green-400" />;
        case 'update':
            return <FaEdit className="text-blue-400" />;
        case 'delete':
            return <FaTrash className="text-red-400" />;
        case 'status':
            return <FaToggleOn className="text-purple-400" />;
        default:
            return null;
    }
};

const formatMessage = (message) => {
    if (typeof message.content === 'string') {
        return message.content;
    }

    if (message.type === 'notification') {
        return (
            <div className="flex items-center gap-2">
                <MessageIcon type={message.content.action} />
                <span>{message.content.message}</span>
            </div>
        );
    }

    return JSON.stringify(message.content);
};

const ChatMessages = ({ messages, loading }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex-1 p-4 space-y-4 overflow-y-auto 
                      scrollbar-thin scrollbar-thumb-zinc-600 
                      scrollbar-track-zinc-800/50 
                      hover:scrollbar-thumb-zinc-500">
            {messages?.map((message, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`max-w-[80%] p-3 rounded-2xl ${message.type === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : message.type === 'error'
                                ? 'bg-red-500/10 text-red-200 rounded-tl-none'
                                : 'bg-zinc-700 text-zinc-200 rounded-tl-none'
                            }`}
                    >
                        <div className="text-sm whitespace-pre-wrap break-words">
                            {formatMessage(message)}
                        </div>
                        <span className="text-xs opacity-50 mt-1 block">
                            {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                    </div>
                </motion.div>
            ))}
            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                >
                    <div className="bg-zinc-700 text-zinc-200 p-3 rounded-2xl rounded-tl-none">
                        <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                    </div>
                </motion.div>
            )}
            <div ref={messagesEndRef} className="h-[1px]" />
        </div>
    );
};

export default ChatMessages;