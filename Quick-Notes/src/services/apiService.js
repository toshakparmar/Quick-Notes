import axios from "axios";

// Use environment variable for API URL or default to a common development port
// Change from port 8080 to 3001 to match the server configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increase timeout to 15 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    // Get the token right before making the request to ensure it's current
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if we've already retried or it's a 401/403
    if (
      originalRequest._retry ||
      (error.response &&
        (error.response.status === 401 || error.response.status === 403))
    ) {
      return Promise.reject(error);
    }

    // Handle timeout and server errors with retry logic
    if (
      error.code === "ECONNABORTED" ||
      !error.response ||
      (error.response && error.response.status >= 500)
    ) {
      originalRequest._retry = true;

      // Wait 2 seconds before retry
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log(`Retrying failed request: ${originalRequest.url}`);

      try {
        return await api(originalRequest);
      } catch (retryError) {
        console.log("Retry failed:", retryError.message);
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);

// Service functions
const apiService = {
  // Add the getBaseUrl function
  getBaseUrl: () => API_BASE_URL,

  // Health check endpoint
  checkServerHealth: async () => {
    try {
      const response = await api.get("/health", { timeout: 5000 });
      return response.data && response.data.status === "ok";
    } catch (error) {
      console.error("Server health check failed:", error.message);
      return false;
    }
  },

  // Generic request methods with improved error handling
  get: async (endpoint, config = {}) => {
    try {
      const response = await api.get(endpoint, config);
      return response.data;
    } catch (error) {
      handleApiError(error, `GET ${endpoint}`);
      throw error;
    }
  },

  post: async (endpoint, data = {}, config = {}) => {
    try {
      const response = await api.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      handleApiError(error, `POST ${endpoint}`);
      throw error;
    }
  },

  put: async (endpoint, data = {}, config = {}) => {
    try {
      const response = await api.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      handleApiError(error, `PUT ${endpoint}`);
      throw error;
    }
  },

  delete: async (endpoint, config = {}) => {
    try {
      const response = await api.delete(endpoint, config);
      return response.data;
    } catch (error) {
      handleApiError(error, `DELETE ${endpoint}`);
      throw error;
    }
  },
};

// Helper function to handle and log API errors
const handleApiError = (error, requestInfo) => {
  if (error.response) {
    // Server responded with an error status
    console.error(`API Error (${requestInfo}):`, error.response.data);
  } else if (error.request) {
    // Request was made but no response received
    console.error(`API No Response (${requestInfo}):`, error.message);
  } else {
    // Error in setting up the request
    console.error(`API Request Error (${requestInfo}):`, error.message);
  }
};

export default apiService;
