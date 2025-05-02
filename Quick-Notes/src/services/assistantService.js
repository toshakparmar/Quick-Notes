import apiService from "./apiService";
import { useAuth } from "../contexts/AuthContext";

const assistantService = {
  sendMessage: async (message) => {
    try {
      // The auth token is automatically included by apiService
      const response = await apiService.post("/quick-notes/assistant", {
        message,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to send message");
      }

      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      throw {
        status: error.response?.status || 500,
        message:
          error.response?.data?.message ||
          "Failed to communicate with assistant",
        data: error.response?.data,
      };
    }
  },

  // Note operations through assistant commands
  getNotes: async () => {
    return assistantService.sendMessage("show all my notes");
  },

  createNote: async (content) => {
    if (!content || typeof content !== "string") {
      throw new Error("Note content is required");
    }
    return assistantService.sendMessage(`create note: ${content}`);
  },

  updateNote: async (noteId, content) => {
    if (!noteId || !content) {
      throw new Error("Note ID and content are required");
    }
    return assistantService.sendMessage(`update note ${noteId} to: ${content}`);
  },

  updateNoteStatus: async (noteId, status) => {
    if (!noteId) {
      throw new Error("Note ID is required");
    }
    const statusText = status ? "complete" : "pending";
    return assistantService.sendMessage(`mark note ${noteId} as ${statusText}`);
  },

  deleteNote: async (noteId) => {
    if (!noteId) {
      throw new Error("Note ID is required");
    }
    return assistantService.sendMessage(`delete note ${noteId}`);
  },

  searchNotes: async (query) => {
    if (!query || typeof query !== "string") {
      throw new Error("Search query is required");
    }
    return assistantService.sendMessage(`search for ${query}`);
  },

  getConversationHistory: async () => {
    try {
      return await apiService.get("/quick-notes/assistant/history");
    } catch (error) {
      console.error("Error fetching conversation history:", error);
      throw new Error("Failed to fetch conversation history");
    }
  },

  clearConversation: async () => {
    try {
      return await apiService.delete("/quick-notes/assistant/clear");
    } catch (error) {
      console.error("Error clearing conversation:", error);
      throw new Error("Failed to clear conversation");
    }
  },
};

export default assistantService;
