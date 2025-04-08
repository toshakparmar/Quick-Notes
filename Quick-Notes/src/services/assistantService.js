import apiService from "./apiService";

const assistantService = {
  sendMessage: async (message) => {
    try {
      const response = await apiService.post("/assistant", { message });

      if (!response.success) {
        throw new Error(response.message || "Failed to send message");
      }

      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error(
        error.response?.data?.message || "Failed to communicate with assistant"
      );
    }
  },

  getConversationHistory: async () => {
    try {
      return await apiService.get("/assistant/history");
    } catch (error) {
      console.error("Error fetching conversation history:", error);
      throw new Error("Failed to fetch conversation history");
    }
  },

  clearConversation: async () => {
    try {
      return await apiService.delete("/assistant/clear");
    } catch (error) {
      console.error("Error clearing conversation:", error);
      throw new Error("Failed to clear conversation");
    }
  },
};

export default assistantService;
