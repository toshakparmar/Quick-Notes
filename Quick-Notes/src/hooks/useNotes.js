import { useState, useEffect, useRef } from "react";
import notesService from "../services/notesService";

export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const initialized = useRef(false);
  const mounted = useRef(false);
  const [animatingNoteId, setAnimatingNoteId] = useState(null);
  const [connectionRetries, setConnectionRetries] = useState(0);
  const maxRetries = 2; // Maximum number of retries

  const fetchNotes = async (force = false) => {
    if ((!force && initialized.current) || !mounted.current) return;

    try {
      setLoading(true);
      setError(null);
      const data = await notesService.getAllNotes();
      if (mounted.current) {
        // Add a small stagger delay for animation purposes
        setTimeout(() => {
          setNotes(data);
          initialized.current = true;
        }, 100);
      }
      // Reset connection retries on successful fetch
      if (connectionRetries > 0) {
        setConnectionRetries(0);
      }
    } catch (err) {
      if (mounted.current) {
        setError(err.message || "Failed to fetch notes");

        // Track connection retries for non-401 errors (auth issues)
        if (!err.status || err.status !== 401) {
          // Implement exponential backoff for retries
          if (connectionRetries < maxRetries) {
            const retryDelay = Math.pow(2, connectionRetries) * 1000; // Exponential backoff
            setTimeout(() => {
              setConnectionRetries((prev) => prev + 1);
              fetchNotes(true);
            }, retryDelay);
          }
        }
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    mounted.current = true;
    fetchNotes();
    return () => {
      mounted.current = false;
    };
  }, []);

  const createNote = async (note) => {
    try {
      setLoading(true);
      const result = await notesService.createNote(note);
      await fetchNotes(true);
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (id, note) => {
    try {
      setAnimatingNoteId(id);
      await notesService.updateNote(id, note);
      await fetchNotes(true);
      setTimeout(() => setAnimatingNoteId(null), 500);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateNoteStatus = async (id, status) => {
    try {
      setLoading(true);
      setAnimatingNoteId(id);

      // Make the API call to update status
      const result = await notesService.updateNoteStatus(id, status);

      // If the API returned updated notes, use them
      if (result && result.notes) {
        setNotes(result.notes);
      } else {
        // Otherwise, just update the note locally as a fallback
        setNotes((prev) =>
          prev.map((note) =>
            note._id === id ? { ...note, status: status } : note
          )
        );
      }

      setTimeout(() => setAnimatingNoteId(null), 500);
      return { success: true, data: result?.statusUpdate };
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id) => {
    try {
      setAnimatingNoteId(id);
      // Optimistic UI update
      setNotes((prev) => prev.filter((note) => note._id !== id));

      // Perform actual deletion
      await notesService.deleteNote(id);

      // Clear animation state
      setTimeout(() => setAnimatingNoteId(null), 500);
    } catch (err) {
      // Restore notes on error
      fetchNotes(true);
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
    animatingNoteId,
    connectionRetries,
  };
};
