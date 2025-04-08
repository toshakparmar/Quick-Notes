import React from 'react';
import BaseModal from './BaseModal';

const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Delete Note"
            indicatorColor="red"
        >
            <div className="p-6">
                <p className="text-zinc-300 text-center mb-6">
                    Are you sure you want to delete this note? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-zinc-600 text-zinc-200 rounded-full hover:bg-zinc-700 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-red-600 text-zinc-200 rounded-full hover:bg-red-700 transition-colors duration-200"
                        onClick={onConfirm}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </BaseModal>
    );
};

export default DeleteModal;