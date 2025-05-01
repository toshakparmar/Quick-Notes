import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

const apiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Request interceptor
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Make sure we use proper Bearer format
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiService.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Only log errors that aren't auth/me 401s (which are expected when not logged in)
    if (
      !(error.config.url.includes("/auth/me") && error.response?.status === 401)
    ) {
      console.error("API Error:", error.response?.data || error.message);
    }

    // Don't remove token here - let AuthContext handle session management

    return Promise.reject({
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });
  }
);

// Simplified methods
const get = async (url) => {
  try {
    return await apiService.get(url);
  } catch (error) {
    throw error;
  }
};

const post = async (url, data) => {
  try {
    return await apiService.post(url, data);
  } catch (error) {
    throw error;
  }
};

const put = async (url, data) => {
  try {
    return await apiService.put(url, data);
  } catch (error) {
    throw error;
  }
};

const del = async (url) => {
  try {
    return await apiService.delete(url);
  } catch (error) {
    throw error;
  }
};

export default {
  get,
  post,
  put,
  delete: del,
};
