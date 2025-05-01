import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService";
import apiService from "../../services/apiService";

// Check server connectivity
export const checkServerStatus = createAsyncThunk(
  "auth/checkServerStatus",
  async (_, { rejectWithValue }) => {
    try {
      const isHealthy = await apiService.checkServerHealth();
      return { isHealthy };
    } catch (error) {
      return rejectWithValue({ error: error.message });
    }
  }
);

// Initial state
const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  loading: false,
  initialized: false,
  error: null,
  serverStatus: {
    isChecking: false,
    isConnected: true,
    lastChecked: null,
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Existing reducers
  },
  extraReducers: (builder) => {
    builder
      // Server status handling
      .addCase(checkServerStatus.pending, (state) => {
        state.serverStatus.isChecking = true;
      })
      .addCase(checkServerStatus.fulfilled, (state, action) => {
        state.serverStatus.isChecking = false;
        state.serverStatus.isConnected = action.payload.isHealthy;
        state.serverStatus.lastChecked = Date.now();
      })
      .addCase(checkServerStatus.rejected, (state) => {
        state.serverStatus.isChecking = false;
        state.serverStatus.isConnected = false;
        state.serverStatus.lastChecked = Date.now();
      });
  },
});

export default authSlice.reducer;
