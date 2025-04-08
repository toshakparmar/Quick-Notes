import axios from "axios";

const API_BASE_URL = "http://localhost:8080/quick-notes";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiService = {
  get: async (endpoint) => {
    const response = await api.get(endpoint);
    return response.data;
  },

  post: async (endpoint, data) => {
    const response = await api.post(endpoint, data);
    return response.data;
  },

  put: async (endpoint, data) => {
    const response = await api.put(endpoint, data);
    return response.data;
  },

  delete: async (endpoint) => {
    const response = await api.delete(endpoint);
    return response.data;
  },
};

export default apiService;
