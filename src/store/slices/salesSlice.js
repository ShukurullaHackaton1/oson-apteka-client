import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { salesAPI } from "../../services/api";

export const fetchSales = createAsyncThunk(
  "sales/fetchSales",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await salesAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Xatolik");
    }
  }
);

export const addSale = createAsyncThunk(
  "sales/addSale",
  async (saleData, { rejectWithValue }) => {
    try {
      const response = await salesAPI.create(saleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Xatolik");
    }
  }
);

const salesSlice = createSlice({
  name: "sales",
  initialState: {
    sales: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      total: 0,
    },
    filters: {
      startDate: "",
      endDate: "",
      doctorId: "",
      page: 1,
      limit: 20,
    },
    isLoading: false,
    error: null,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    addNewSale: (state, action) => {
      state.sales.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sales
      .addCase(fetchSales.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sales = action.payload.sales;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        };
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add sale
      .addCase(addSale.fulfilled, (state, action) => {
        state.sales.unshift(action.payload);
      });
  },
});

export const { setFilters, clearError, addNewSale } = salesSlice.actions;
export default salesSlice.reducer;
