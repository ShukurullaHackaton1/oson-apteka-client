// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI } from "../../services/api";

// Login async thunk
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(username, password);
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Ошибка входа");
    }
  }
);

// Check token validity
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Токен не найден");
      }

      // Простая проверка токена - проверяем срок действия
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;

      if (payload.exp < currentTime) {
        localStorage.removeItem("token");
        throw new Error("Токен истек");
      }

      // Если токен валидный, возвращаем данные пользователя
      return {
        user: {
          id: payload.userId,
          username: payload.username || "admin",
          role: payload.role || "admin",
        },
      };
    } catch (error) {
      localStorage.removeItem("token");
      return rejectWithValue("Токен недействителен");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token"),
    isLoading: false,
    isAuthenticated: !!localStorage.getItem("token"),
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("osonKassaToken");
      localStorage.removeItem("osonKassaTokenExpiry");
    },
    clearError: (state) => {
      state.error = null;
    },
    // Токен проверкасини бошлашда loading holatini o'rnatish
    setAuthLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    // Токен мавжуд бўлганда authenticated ҳолатини ўрнатиш
    setAuthenticated: (state) => {
      const token = localStorage.getItem("token");
      if (token) {
        state.isAuthenticated = true;
        state.token = token;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Check auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout, clearError, setAuthLoading, setAuthenticated } =
  authSlice.actions;
export default authSlice.reducer;
