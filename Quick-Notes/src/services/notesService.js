import apiService from "./apiService";

const notesService = {
  getAllNotes: async () => {
    try {
      return await apiService.get("/quick-notes");
    } catch (error) {
      console.error("Error fetching notes:", error);
      // Return empty array instead of throwing error to prevent UI breaking
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
};

export default notesService;
