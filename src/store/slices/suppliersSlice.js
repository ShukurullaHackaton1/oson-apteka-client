// src/store/slices/suppliersSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { suppliersAPI } from "../../services/api";

export const fetchSuppliers = createAsyncThunk(
  "suppliers/fetchSuppliers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await suppliersAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Ошибка");
    }
  }
);

export const addSupplier = createAsyncThunk(
  "suppliers/addSupplier",
  async (supplierData, { rejectWithValue }) => {
    try {
      const response = await suppliersAPI.create(supplierData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Ошибка");
    }
  }
);

export const updateSupplier = createAsyncThunk(
  "suppliers/updateSupplier",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await suppliersAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Ошибка");
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  "suppliers/deleteSupplier",
  async (id, { rejectWithValue }) => {
    try {
      await suppliersAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Ошибка");
    }
  }
);

export const resetSupplierPassword = createAsyncThunk(
  "suppliers/resetPassword",
  async (id, { rejectWithValue }) => {
    try {
      const response = await suppliersAPI.resetPassword(id);
      return { id, newPassword: response.data.newPassword };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Ошибка");
    }
  }
);

const suppliersSlice = createSlice({
  name: "suppliers",
  initialState: {
    suppliers: [],
    isLoading: false,
    error: null,
    newPassword: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearNewPassword: (state) => {
      state.newPassword = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch suppliers
      .addCase(fetchSuppliers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suppliers = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add supplier
      .addCase(addSupplier.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addSupplier.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suppliers.push(action.payload);
      })
      .addCase(addSupplier.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update supplier
      .addCase(updateSupplier.fulfilled, (state, action) => {
        const index = state.suppliers.findIndex(
          (s) => s._id === action.payload._id
        );
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
      })
      // Delete supplier
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.suppliers = state.suppliers.filter(
          (s) => s._id !== action.payload
        );
      })
      // Reset password
      .addCase(resetSupplierPassword.fulfilled, (state, action) => {
        state.newPassword = action.payload.newPassword;
      });
  },
});

export const { clearError, clearNewPassword } = suppliersSlice.actions;
export default suppliersSlice.reducer;
