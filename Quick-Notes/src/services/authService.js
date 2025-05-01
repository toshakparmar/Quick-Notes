import apiService from "./apiService";

const authService = {
  login: async (credentials) => {
    try {
      const response = await apiService.post("/auth/login", credentials);
      if (response && response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
      } else {
        throw new Error("No token received from server");
      }
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await apiService.post("/auth/register", userData);
      return response;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    // Don't attempt fetch if no token exists
    const token = localStorage.getItem("token");
    if (!token) {
      return Promise.reject({ status: 401, message: "No token found" });
    }

    try {
      const response = await apiService.get("/auth/me");
      return response;
    } catch (error) {
      // Better error logging
      console.warn("Auth token validation failed", error.message || error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export default authService;
