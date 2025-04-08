import { useState, useEffect } from "react";
import notesService from "../services/notesService";

export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await notesService.getAllNotes();
      setNotes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const createNote = async (note) => {
    try {
      await notesService.createNote(note);
      await fetchNotes();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateNote = async (id, note) => {
    try {
      await notesService.updateNote(id, note);
      await fetchNotes();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteNote = async (id) => {
    try {
      await notesService.deleteNote(id);
      await fetchNotes();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getNoteById = async (id) => {
    try {
      await notesService.getNoteById(id);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateNoteStatus = async (id, status) => {
    try {
      setLoading(true);
      const { statusUpdate, notes } = await notesService.updateNoteStatus(
        id,
        status
      );

      if (statusUpdate && notes) {
        setNotes(notes); // Update with fresh notes
        return { success: true, data: statusUpdate };
      }
      throw new Error("Failed to update note status");
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    fetchNotes,
    getNoteById,
    updateNoteStatus,
  };
};
