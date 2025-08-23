import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { medicinesAPI } from "../../services/api";

export const fetchMedicines = createAsyncThunk(
  "medicines/fetchMedicines",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await medicinesAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Xatolik");
    }
  }
);

export const fetchCategories = createAsyncThunk(
  "medicines/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await medicinesAPI.getCategories();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Xatolik");
    }
  }
);

const medicinesSlice = createSlice({
  name: "medicines",
  initialState: {
    medicines: [],
    categories: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      total: 0,
    },
    filters: {
      search: "",
      category: "",
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
      // Fetch medicines
      .addCase(fetchMedicines.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMedicines.fulfilled, (state, action) => {
        state.isLoading = false;
        state.medicines = action.payload.medicines;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        };
      })
      .addCase(fetchMedicines.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const { setFilters, clearError } = medicinesSlice.actions;
export default medicinesSlice.reducer;
