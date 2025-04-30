import apiService from "./apiService";

const authService = {
  login: async (credentials) => {
    try {
      // Ensure data format matches what backend expects
      const payload = {
        email: credentials.email,
        password: credentials.password,
      };

      const response = await apiService.post("/auth/login", payload);

      if (response && response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user || response));
      }
      return response;
    } catch (error) {
      console.error("Login error:", error);
      // Format the error message to be more user-friendly
      const errorMsg =
        error.message || "Login failed. Please check your credentials.";
      throw new Error(errorMsg);
    }
  },

  register: async (userData) => {
    try {
      const response = await apiService.post("/auth/register", userData);
      // Don't set token here since we want user to login after registration
      return response;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await apiService.get("/auth/me");
      if (response) {
        localStorage.setItem("user", JSON.stringify(response));
      }
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      throw error;
    }
  },
};

export default authService;
