// src/services/api.js
import axios from "axios";
import toast from "react-hot-toast";

// Base API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - token qo'shish
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xatolarni boshqarish
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || "Noma'lum xatolik yuz berdi";

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      toast.error("Avtorizatsiya tugagan. Qaytadan kiring.");
    } else if (error.response?.status === 403) {
      toast.error("Sizda bu amalni bajarish uchun ruxsat yo'q");
    } else if (error.response?.status >= 500) {
      toast.error("Server xatosi. Iltimos, keyinroq urinib ko'ring.");
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) =>
    api.post("/auth/login", { username, password }),

  verifyToken: () => api.get("/auth/verify"),
};

// Doctors API
export const doctorsAPI = {
  getAll: () => api.get("/doctors"),

  getById: (id) => api.get(`/doctors/${id}`),

  create: (data) => api.post("/doctors", data),

  update: (id, data) => api.put(`/doctors/${id}`, data),

  delete: (id) => api.delete(`/doctors/${id}`),

  resetPassword: (id) => api.post(`/doctors/${id}/reset-password`),
};

// Medicines API
export const medicinesAPI = {
  getAll: (params) => api.get("/medicines", { params }),

  getById: (id) => api.get(`/medicines/${id}`),

  getCategories: () => api.get("/medicines/categories"),

  search: (query) => api.get(`/medicines?search=${encodeURIComponent(query)}`),
};

// Sales API
export const salesAPI = {
  getAll: (params) => api.get("/sales", { params }),

  getById: (id) => api.get(`/sales/${id}`),

  create: (data) => api.post("/sales", data),

  update: (id, data) => api.put(`/sales/${id}`, data),

  delete: (id) => api.delete(`/sales/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),

  getTopDoctors: (period = "month") =>
    api.get(`/dashboard/top-doctors?period=${period}`),

  getRecentSales: (limit = 10) =>
    api.get(`/dashboard/recent-sales?limit=${limit}`),

  syncERP: () => api.post("/dashboard/sync-erp"),

  getSyncHistory: () => api.get("/dashboard/sync-history"),

  getERPHealth: () => api.get("/dashboard/erp-health"),
};

export default api;
