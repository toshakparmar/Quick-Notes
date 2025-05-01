import axios from "axios";

// Try to automatically detect the correct backend URL
const determineApiUrl = () => {
  // In Vite, environment variables need to be prefixed with VITE_
  // and accessed via import.meta.env instead of process.env
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Fallback to the current host with default backend port
  const currentHost = window.location.hostname;

  // For local development
  if (currentHost === "localhost" || currentHost === "127.0.0.1") {
    return `http://${currentHost}:8080`;
  }

  // For production, you might want to use the same host but different port
  // or a specific API domain
  return `https://${currentHost}/api`;
};

const API_BASE_URL = determineApiUrl();

// Track if API service is temporarily paused
let apiServicePaused = false;

// Create a recovery mechanism for Vite development server issues
const handleViteDevServerRestart = () => {
  // Only apply in development mode
  const isDev = import.meta.env.DEV;

  if (isDev) {
    // Listen to Vite's custom event
    window.addEventListener("vite:beforeUpdate", () => {
      console.log("Vite HMR update detected - pausing API requests");
      apiServicePaused = true;

      // Resume API service after a short delay
      setTimeout(() => {
        console.log("Resuming API service after HMR update");
        apiServicePaused = false;
      }, 1000);
    });
  }
};

// Create api service with retry capability
const createApiService = () => {
  const service = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: false,
    timeout: 10000, // 10 second timeout
  });

  // Request interceptor - add check for paused service
  service.interceptors.request.use(
    (config) => {
      // If service is paused due to HMR, delay the request
      if (apiServicePaused) {
        return new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (!apiServicePaused) {
              clearInterval(checkInterval);
              // Apply auth token
              const token = localStorage.getItem("token");
              if (token) {
                config.headers.Authorization = `Bearer ${token}`;
              }
              resolve(config);
            }
          }, 100);
        });
      }

      // Normal flow when not paused
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      console.error("Request error:", error);
      return Promise.reject(error);
    }
  );

  // Response interceptor with retry logic
  service.interceptors.response.use(
    (response) => response.data,
    async (error) => {
      const originalRequest = error.config;

      // Retry once for network errors and 5xx server errors (except auth routes)
      if (
        !originalRequest._retry &&
        (error.code === "ECONNABORTED" ||
          !error.response ||
          error.response.status >= 500) &&
        !originalRequest.url.includes("/auth/")
      ) {
        originalRequest._retry = true;

        // Wait 2 seconds before retry
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log(`Retrying failed request: ${originalRequest.url}`);

        try {
          return await service(originalRequest);
        } catch (retryError) {
          // If retry also fails, continue to error handling
          console.log("Retry failed:", retryError.message);
        }
      }

      // Handle connection errors
      if (error.code === "ECONNABORTED" || !error.response) {
        console.error("API Connection Error:", error.message);

        console.warn(`
          Backend connection failed. Please ensure that:
          1. The backend server is running at ${API_BASE_URL}
          2. CORS is properly configured on the backend
          3. There are no network issues
        `);

        return Promise.reject({
          status: 0,
          message:
            "Unable to connect to the server. Please check your internet connection or try again later.",
          isConnectionError: true,
        });
      }

      // Handle normal response errors
      console.error("API Error:", error.response?.data || error.message);

      return Promise.reject({
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
      });
    }
  );

  return service;
};

const apiService = createApiService();

// Initialize Vite HMR handling
handleViteDevServerRestart();

// Simplified methods
const get = async (url, options = {}) => {
  try {
    return await apiService.get(url, options);
  } catch (error) {
    throw error;
  }
};

const post = async (url, data, options = {}) => {
  try {
    return await apiService.post(url, data, options);
  } catch (error) {
    throw error;
  }
};

const put = async (url, data, options = {}) => {
  try {
    return await apiService.put(url, data, options);
  } catch (error) {
    throw error;
  }
};

const del = async (url, options = {}) => {
  try {
    return await apiService.delete(url, options);
  } catch (error) {
    throw error;
  }
};

// Health check function to test backend availability
const checkServerHealth = async () => {
  try {
    await get("/health", { timeout: 3000 });
    return true;
  } catch (error) {
    return false;
  }
};

export default {
  get,
  post,
  put,
  delete: del,
  checkServerHealth,
  getBaseUrl: () => API_BASE_URL,
};
