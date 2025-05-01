import apiService from "./apiService";

// Fallback data for when server is unavailable during development
const DEMO_NOTES = [
  {
    _id: "demo-1",
    noteId: 1,
    note: "Demo note - Your backend server appears to be offline. This is a placeholder note.",
    date: new Date().toISOString(),
    status: false,
  },
  {
    _id: "demo-2",
    noteId: 2,
    note:
      "To fix this, ensure your backend server is running at " +
      apiService.getBaseUrl(),
    date: new Date().toISOString(),
    status: false,
  },
];

const notesService = {
  getAllNotes: async () => {
    try {
      return await apiService.get("/quick-notes");
    } catch (error) {
      console.error("Error fetching notes:", error);
      // During development, return demo data when server is unavailable
      if (
        process.env.NODE_ENV !== "production" &&
        (!error.status || error.message.includes("Network Error"))
      ) {
        console.warn("Using demo notes due to server connection issues");
        return DEMO_NOTES;
      }
      // Return empty array to prevent UI breaking
      return [];
    }
  },

  createNote: async (noteData) => {
    try {
      // Fix the endpoint to match backend route
      return await apiService.post("/quick-notes/create", { note: noteData });
    } catch (error) {
      console.error("Error creating note:", error);
      throw new Error("Failed to create note");
    }
  },

  updateNote: async (id, noteData) => {
    try {
      const response = await apiService.put(`/quick-notes/update/${id}`, {
        note: noteData,
      });
      if (!response) {
        throw new Error("No response from server");
      }
      return {
        success: true,
        message: "Note updated successfully",
        note: response,
      };
    } catch (error) {
      console.error("Error updating note:", error);
      throw new Error("Failed to update note");
    }
  },

  deleteNote: async (id) => {
    try {
      return await apiService.delete(`/quick-notes/delete/${id}`);
    } catch (error) {
      console.error("Error deleting note:", error);
      throw new Error("Failed to delete note");
    }
  },

  getNoteById: async (id) => {
    try {
      const response = await apiService.get(`/get-note/${id}`);
      return response[0];
    } catch (error) {
      console.error("Error fetching note:", error);
      throw new Error("Failed to fetch note");
    }
  },

  updateNoteStatus: async (id, status) => {
    try {
      // Fix the endpoint to include the correct path
      const response = await apiService.put(
        `/quick-notes/update-status/${id}`,
        {
          status: Boolean(status),
        }
      );

      if (!response) {
        throw new Error("No response from server");
      }

      // Fetch fresh notes after status update
      const updatedNotes = await notesService.getAllNotes();
      return {
        statusUpdate: response,
        notes: updatedNotes,
      };
    } catch (error) {
      console.error("Error updating note status:", error);
      throw new Error("Failed to update note status");
    }
  },

  exportToPdf: async (id) => {
    try {
      return await apiService.get(`/export-pdf/${id}`);
    } catch (error) {
      console.error("Error exporting note to PDF:", error);
      throw new Error("Failed to export note to PDF");
    }
  },

  searchNotes: async (query) => {
    try {
      // Search endpoint that will filter by user on the backend
      return await apiService.get(
        `/quick-notes/search?q=${encodeURIComponent(query)}`
      );
    } catch (error) {
      console.error("Error searching notes:", error);

      // During development, provide fallback search
      if (
        process.env.NODE_ENV !== "production" &&
        (!error.status || error.message.includes("Network Error"))
      ) {
        console.warn(
          "Using client-side search due to server connection issues"
        );
        const demoNotes = DEMO_NOTES.filter((note) =>
          note.note.toLowerCase().includes(query.toLowerCase())
        );
        return demoNotes;
      }

      throw new Error("Failed to search notes");
    }
  },
};

export default notesService;
