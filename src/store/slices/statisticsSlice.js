import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { statisticsAPI } from "../../services/api";

export const fetchStatistics = createAsyncThunk(
  "statistics/fetchStatistics",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await statisticsAPI.getOverview(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Ошибка");
    }
  }
);

export const fetchSyncStatus = createAsyncThunk(
  "statistics/fetchSyncStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await statisticsAPI.getSyncStatus();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Ошибка");
    }
  }
);

export const triggerManualSync = createAsyncThunk(
  "statistics/triggerManualSync",
  async (_, { rejectWithValue }) => {
    try {
      const response = await statisticsAPI.manualSync();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Ошибка");
    }
  }
);

const statisticsSlice = createSlice({
  name: "statistics",
  initialState: {
    data: {
      totalRevenue: 0,
      revenueChange: 0,
      totalSales: 0,
      salesChange: 0,
      totalProducts: 0,
      productsChange: 0,
      activeDoctors: 0,
      doctorsChange: 0,
      salesByDay: [],
      salesByCategory: [],
      salesByBranch: [],
      topProducts: [],
      supplierStats: [],
      branches: [],
    },
    syncStatus: null,
    isLoading: false,
    isSyncing: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch statistics
      .addCase(fetchStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch sync status
      .addCase(fetchSyncStatus.fulfilled, (state, action) => {
        state.syncStatus = action.payload;
      })
      // Manual sync
      .addCase(triggerManualSync.pending, (state) => {
        state.isSyncing = true;
      })
      .addCase(triggerManualSync.fulfilled, (state) => {
        state.isSyncing = false;
      })
      .addCase(triggerManualSync.rejected, (state) => {
        state.isSyncing = false;
      });
  },
});

export const { clearError } = statisticsSlice.actions;
export default statisticsSlice.reducer;
