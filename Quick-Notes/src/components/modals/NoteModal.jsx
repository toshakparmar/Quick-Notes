import React from 'react';
import BaseModal from './BaseModal';

const NoteModal = ({ isOpen, onClose, note, onSave }) => {
  const [noteContent, setNoteContent] = React.useState(note?.note || '');

  React.useEffect(() => {
    setNoteContent(note?.note || '');
  }, [note]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={note ? "Edit Note" : "Add New Note"}
      indicatorColor="blue"
    >
      <div className="p-4">
        <textarea
          className="w-full p-3 resize-none bg-zinc-700 rounded-xl text-zinc-200 outline-none placeholder-zinc-400"
          placeholder="Enter your note here..."
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          rows={6}
          autoFocus
        />
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-600 text-zinc-200 rounded-full hover:bg-zinc-700 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-zinc-200 rounded-full hover:bg-blue-700 transition-colors duration-200"
            onClick={() => {
              onSave(noteContent);
              onClose();
            }}
          >
            {note ? "Update Note" : "Save Note"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default NoteModal;