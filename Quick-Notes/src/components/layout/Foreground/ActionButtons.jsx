import React from 'react';
import { IoMdAdd } from 'react-icons/io';
import { FaRobot } from 'react-icons/fa';
import ActionButton from '../../ui/ActionButton';

const ActionButtons = ({ modalStates, onActionClick }) => {
    const isAnyModalOpen = Object.values(modalStates).some(Boolean);

    return (
        <div className={`fixed bottom-4 right-4 md:right-8 flex flex-row space-x-4 z-20 
            ${isAnyModalOpen ? 'pointer-events-none opacity-50' : ''}`}
        >
            <ActionButton
                className="bg-blue-600 hover:bg-blue-700"
                icon={IoMdAdd}
                onClick={() => onActionClick('isNoteOpen', true)}
                tooltip="Add New Note"
            />
            <ActionButton
                className="bg-blue-600 hover:bg-blue-700"
                icon={FaRobot}
                onClick={() => onActionClick('isChatOpen', true)}
                tooltip={modalStates.isChatOpen ? 'Close Assistant' : 'Quick Assistant'}
                active={modalStates.isChatOpen}
            />
        </div>
    );
};

export default ActionButtons;