import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { doctorsAPI } from "../../services/api";

export const fetchDoctors = createAsyncThunk(
  "doctors/fetchDoctors",
  async (_, { rejectWithValue }) => {
    try {
      const response = await doctorsAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Xatolik");
    }
  }
);

export const addDoctor = createAsyncThunk(
  "doctors/addDoctor",
  async (doctorData, { rejectWithValue }) => {
    try {
      const response = await doctorsAPI.create(doctorData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Xatolik");
    }
  }
);

export const updateDoctor = createAsyncThunk(
  "doctors/updateDoctor",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await doctorsAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Xatolik");
    }
  }
);

export const deleteDoctor = createAsyncThunk(
  "doctors/deleteDoctor",
  async (id, { rejectWithValue }) => {
    try {
      await doctorsAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Xatolik");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "doctors/resetPassword",
  async (id, { rejectWithValue }) => {
    try {
      const response = await doctorsAPI.resetPassword(id);
      return { id, newPassword: response.data.newPassword };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Xatolik");
    }
  }
);

const doctorsSlice = createSlice({
  name: "doctors",
  initialState: {
    doctors: [],
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
      // Fetch doctors
      .addCase(fetchDoctors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add doctor
      .addCase(addDoctor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addDoctor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.doctors.push(action.payload);
        state.newPassword = action.payload.generatedPassword;
      })
      .addCase(addDoctor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update doctor
      .addCase(updateDoctor.fulfilled, (state, action) => {
        const index = state.doctors.findIndex(
          (d) => d._id === action.payload._id
        );
        if (index !== -1) {
          state.doctors[index] = action.payload;
        }
      })
      // Delete doctor
      .addCase(deleteDoctor.fulfilled, (state, action) => {
        state.doctors = state.doctors.filter((d) => d._id !== action.payload);
      })
      // Reset password
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.newPassword = action.payload.newPassword;
      });
  },
});

export const { clearError, clearNewPassword } = doctorsSlice.actions;
export default doctorsSlice.reducer;
