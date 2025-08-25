// src/services/api.js - Port va konfiguratsiya tuzatilgan
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3003/api";

console.log("🌐 API Base URL:", API_BASE_URL);

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

    // Debug uchun
    if (config.url?.includes("sync")) {
      console.log(
        `📡 API so'rov: ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    return config;
  },
  (error) => {
    console.error("❌ API so'rov xatoligi:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Debug uchun
    if (response.config.url?.includes("sync")) {
      console.log(`✅ API javob: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || "Неизвестная ошибка";

    console.error("❌ API javob xatoligi:", {
      status: error.response?.status,
      url: error.config?.url,
      message,
    });

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      toast.error("Сессия истекла. Войдите снова.");
    } else if (error.response?.status === 403) {
      toast.error("У вас нет прав для этого действия");
    } else if (error.response?.status >= 500) {
      toast.error("Ошибка сервера. Попробуйте позже.");
    } else if (error.code === "ECONNREFUSED") {
      toast.error("Нет соединения с сервером");
    } else if (error.code === "ENOTFOUND") {
      toast.error("Сервер не найден");
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) =>
    api.post("/auth/login", { username, password }),
  register: (userData) => api.post("/auth/register", userData),
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
  getSyncStatus: () => api.get("/sync/status"),
  manualSync: () => api.post("/sync/full"),
  getReports: (params) => api.get("/statistics/reports", { params }),
  exportData: (params) =>
    api.get("/statistics/export", {
      params,
      responseType: "blob",
    }),
};

// Sync API (yangi va asosiy)
export const syncAPI = {
  fromFrontend: (data) => {
    console.log(
      "📤 Frontend ma'lumoti yuborilmoqda:",
      data.items?.length,
      "ta element"
    );
    return api.post("/sync/from-frontend", { data });
  },
  fullSync: () => api.post("/sync/full"),
  getStatus: () => api.get("/sync/status"),
  getStatistics: () => api.get("/sync/statistics"),
  testConnection: () => api.get("/sync/test"),
  cleanup: (daysOld) => api.post("/sync/cleanup", { daysOld }),
  stop: () => api.post("/sync/stop"),
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

// Health check
export const healthAPI = {
  check: () => api.get("/health"),
  syncStatus: () => api.get("/sync-status"), // deprecated endpoint
};

export default api;
