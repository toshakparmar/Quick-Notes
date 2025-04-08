import React, { useRef, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

const ChatInput = ({ value, onChange, onSubmit, loading }) => {
    const textareaRef = useRef(null);

    // Auto resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = '44px';
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = Math.min(scrollHeight, 120) + 'px';
        }
    }, [value]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit(e);
        }
    };

    return (
        <form onSubmit={onSubmit} className="flex items-end gap-2 p-4 bg-zinc-800 border-t border-zinc-700">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 p-3 min-h-[44px] max-h-[120px] bg-zinc-700 rounded-xl 
                         text-zinc-200 placeholder-zinc-400 resize-none outline-none
                         overflow-hidden scrollbar-none"
                rows={1}
            />
            <button
                type="submit"
                disabled={loading || !value?.trim()}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                         flex-shrink-0"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent 
                                  rounded-full animate-spin" />
                ) : (
                    <FaArrowUp />
                )}
            </button>
        </form>
    );
};

export default ChatInput;