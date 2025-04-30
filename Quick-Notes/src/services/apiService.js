import axios from "axios";

const apiService = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Update response interceptor
apiService.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);

    // Format error message based on server response
    if (error.response?.status === 500) {
      // Log detailed error for debugging
      console.error("Server error details:", error.response?.data);
      error.message = "Server error occurred. Please try again later.";
    }

    return Promise.reject({
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });
  }
);

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
