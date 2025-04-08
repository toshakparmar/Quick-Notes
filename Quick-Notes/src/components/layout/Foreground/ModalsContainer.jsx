import React from 'react';
import { AnimatePresence } from 'framer-motion';
import NoteModal from '../../modals/NoteModal';
import DeleteModal from '../../modals/DeleteModal';
import ViewModal from '../../modals/ViewModal';

const ModalsContainer = ({
    modalStates,
    selectedNote,
    onClose,
    onNoteCreate,
    onNoteUpdate,
    onNoteDelete
}) => {
    return (
        <div className="relative z-30">
            <AnimatePresence>
                {modalStates.isNoteOpen && (
                    <NoteModal
                        isOpen={modalStates.isNoteOpen}
                        onClose={() => onClose('isNoteOpen', false)}
                        note={selectedNote}
                        onSave={(noteContent) => {
                            if (selectedNote) {
                                onNoteUpdate(selectedNote._id, noteContent);
                            } else {
                                onNoteCreate(noteContent);
                            }
                            onClose('isNoteOpen', false);
                        }}
                    />
                )}

                {modalStates.isDeleteOpen && (
                    <DeleteModal
                        isOpen={modalStates.isDeleteOpen}
                        onClose={() => onClose('isDeleteOpen', false)}
                        onConfirm={() => {
                            onNoteDelete();
                            onClose('isDeleteOpen', false);
                        }}
                    />
                )}

                {modalStates.isViewOpen && (
                    <ViewModal
                        isOpen={modalStates.isViewOpen}
                        onClose={() => onClose('isViewOpen', false)}
                        note={selectedNote}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ModalsContainer;