import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productsAPI } from "../../services/api";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Ошибка");
    }
  }
);

export const fetchBranches = createAsyncThunk(
  "products/fetchBranches",
  async (_, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getBranches();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Ошибка");
    }
  }
);

export const fetchProductSuppliers = createAsyncThunk(
  "products/fetchSuppliers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getSuppliers();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Ошибка");
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    branches: [],
    suppliers: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      total: 0,
    },
    filters: {
      search: "",
      branch: "",
      supplier: "",
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch branches
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.branches = action.payload;
      })
      // Fetch suppliers
      .addCase(fetchProductSuppliers.fulfilled, (state, action) => {
        state.suppliers = action.payload;
      });
  },
});

export const { setFilters, clearError } = productsSlice.actions;
export default productsSlice.reducer;
