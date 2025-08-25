export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  return new Date(date).toLocaleDateString("ru-RU", defaultOptions);
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString("ru-RU", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Currency formatting для Узбекистана
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "0 сум";
  return new Intl.NumberFormat("ru-RU").format(amount) + " сум";
};

// Text truncation
export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + "...";
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Validation helpers
export const validateRequired = (value) => {
  return value && value.toString().trim() !== "";
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^\+?[1-9]\d{8,14}$/;
  return re.test(phone);
};

// Generate random string
export const generateRandomString = (length = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// File size formatting
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 байт";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["байт", "КБ", "МБ", "ГБ", "ТБ", "ПБ", "ЭБ", "ЗБ", "ИБ"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      return true;
    } catch (err) {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
};

// Local storage helpers
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error("Storage get error:", error);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Storage set error:", error);
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Storage remove error:", error);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Storage clear error:", error);
      return false;
    }
  },
};

// Status translation helpers
export const translateStatus = (status) => {
  const translations = {
    active: "Активен",
    inactive: "Неактивен",
    pending: "Ожидание",
    completed: "Завершено",
    error: "Ошибка",
    success: "Успешно",
    failed: "Не удалось",
    syncing: "Синхронизация",
    idle: "Ожидание",
  };
  return translations[status] || status;
};

// Number formatting for large numbers
export const formatLargeNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "М";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "К";
  }
  return num.toString();
};

// Time ago formatting
export const timeAgo = (date) => {
  const now = new Date();
  const secondsAgo = Math.floor((now - new Date(date)) / 1000);

  if (secondsAgo < 60) return "только что";
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} мин назад`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)} ч назад`;
  if (secondsAgo < 2592000) return `${Math.floor(secondsAgo / 86400)} дн назад`;

  return formatDate(date);
};

// Generate color from string
export const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

// Percentage calculation
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
export const isEmpty = (obj) => {
  if (obj === null || obj === undefined) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === "object") return Object.keys(obj).length === 0;
  if (typeof obj === "string") return obj.trim() === "";
  return false;
};
