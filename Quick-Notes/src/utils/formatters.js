export const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  export const truncateText = (text, maxLength = 80) => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  };
  
  export const generateNoteId = (notes) => {
    const maxId = notes.reduce((max, note) => 
      Math.max(max, parseInt(note.noteId) || 0), 0);
    return (maxId + 1).toString();
  };