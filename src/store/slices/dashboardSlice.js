import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardAPI } from "../../services/api";

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Xatolik");
    }
  }
);

export const fetchTopDoctors = createAsyncThunk(
  "dashboard/fetchTopDoctors",
  async (period = "month", { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getTopDoctors(period);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Xatolik");
    }
  }
);

export const fetchRecentSales = createAsyncThunk(
  "dashboard/fetchRecentSales",
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getRecentSales(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Xatolik");
    }
  }
);

export const syncERP = createAsyncThunk(
  "dashboard/syncERP",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.syncERP();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Xatolik");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats: {
      today: { totalSales: 0, totalAmount: 0 },
      weekly: { totalSales: 0, totalAmount: 0 },
      monthly: { totalSales: 0, totalAmount: 0 },
      totals: { doctors: 0, medicines: 0, lowStock: 0 },
    },
    topDoctors: [],
    recentSales: [],
    syncInfo: {
      isLoading: false,
      lastSync: null,
      status: "idle",
    },
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch top doctors
      .addCase(fetchTopDoctors.fulfilled, (state, action) => {
        state.topDoctors = action.payload;
      })
      // Fetch recent sales
      .addCase(fetchRecentSales.fulfilled, (state, action) => {
        state.recentSales = action.payload;
      })
      // Sync ERP
      .addCase(syncERP.pending, (state) => {
        state.syncInfo.isLoading = true;
        state.syncInfo.status = "syncing";
      })
      .addCase(syncERP.fulfilled, (state, action) => {
        state.syncInfo.isLoading = false;
        state.syncInfo.status = "success";
        state.syncInfo.lastSync = new Date().toISOString();
      })
      .addCase(syncERP.rejected, (state, action) => {
        state.syncInfo.isLoading = false;
        state.syncInfo.status = "error";
        state.error = action.payload;
      });
  },
});

export const { clearError, updateStats } = dashboardSlice.actions;
export default dashboardSlice.reducer;
