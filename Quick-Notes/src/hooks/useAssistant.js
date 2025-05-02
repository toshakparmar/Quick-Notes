import { useState } from "react";
import assistantService from "../services/assistantService";

export const useAssistant = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle assistant operations with loading and error states
  const performAssistantOperation = async (operation, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await operation(...args);
      return result;
    } catch (err) {
      setError(err.message || "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Note operations through assistant
  const getNotes = () => performAssistantOperation(assistantService.getNotes);

  const createNote = (content) =>
    performAssistantOperation(assistantService.createNote, content);

  const updateNote = (noteId, content) =>
    performAssistantOperation(assistantService.updateNote, noteId, content);

  const updateNoteStatus = (noteId, status) =>
    performAssistantOperation(
      assistantService.updateNoteStatus,
      noteId,
      status
    );

  const deleteNote = (noteId) =>
    performAssistantOperation(assistantService.deleteNote, noteId);

  const searchNotes = (query) =>
    performAssistantOperation(assistantService.searchNotes, query);

  // General assistant messaging
  const sendMessage = (message) =>
    performAssistantOperation(assistantService.sendMessage, message);

  return {
    loading,
    error,
    sendMessage,
    getNotes,
    createNote,
    updateNote,
    updateNoteStatus,
    deleteNote,
    searchNotes,
  };
};
