// src/services/api.js - Добавляем новые API endpoints
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Неизвестная ошибка";

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      toast.error("Сессия истекла. Войдите снова.");
    } else if (error.response?.status === 403) {
      toast.error("У вас нет прав для этого действия");
    } else if (error.response?.status >= 500) {
      toast.error("Ошибка сервера. Попробуйте позже.");
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

// Suppliers API
export const suppliersAPI = {
  getAll: () => api.get("/suppliers"),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post("/suppliers", data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
  resetPassword: (id) => api.post(`/suppliers/${id}/reset-password`),
  getProducts: (id, params) => api.get(`/suppliers/${id}/products`, { params }),
};

// Products API (Oson Kassa products)
export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  getBranches: () => api.get("/products/branches"),
  getSuppliers: () => api.get("/products/suppliers"),
  search: (query) => api.get(`/products?search=${encodeURIComponent(query)}`),
};

// Medicines API (старый API для обратной совместимости)
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

// Statistics API
export const statisticsAPI = {
  getOverview: (params) => api.get("/statistics/overview", { params }),
  getSyncStatus: () => api.get("/statistics/sync-status"),
  manualSync: () => api.post("/statistics/sync/manual"),
  getReports: (params) => api.get("/statistics/reports", { params }),
  exportData: (params) =>
    api.get("/statistics/export", {
      params,
      responseType: "blob",
    }),
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

// Reports API
export const reportsAPI = {
  getSalesReport: (params) => api.get("/reports/sales", { params }),
  getInventoryReport: (params) => api.get("/reports/inventory", { params }),
  getDoctorReport: (doctorId, params) =>
    api.get(`/reports/doctor/${doctorId}`, { params }),
  getSupplierReport: (supplierId, params) =>
    api.get(`/reports/supplier/${supplierId}`, { params }),
  generatePDF: (type, params) =>
    api.post(
      "/reports/generate-pdf",
      { type, ...params },
      { responseType: "blob" }
    ),
  generateExcel: (type, params) =>
    api.post(
      "/reports/generate-excel",
      { type, ...params },
      { responseType: "blob" }
    ),
};

export default api;
