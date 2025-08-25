import { io } from "socket.io-client";
import { store } from "../store/store";
import { addNewSale } from "../store/slices/salesSlice";
import { updateStats } from "../store/slices/dashboardSlice";
import toast from "react-hot-toast";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000; // 3 секунды
  }

  connect() {
    if (this.socket?.connected) {
      console.log("Socket allaqachon ulangan");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Token mavjud emas, socket ulanmaydi");
      return;
    }

    // API URL dan Socket.IO URL ni aniqlash
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3003";
    const SOCKET_URL = API_URL.replace("/api", ""); // /api qismini olib tashlash

    console.log("Socket.IO ulanish URL:", SOCKET_URL);

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"], // Polling ham qo'shildi fallback uchun
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      forceNew: true,
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Socket.IO ga ulanish muvaffaqiyatli");
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Admin room ga qo'shilish
      this.socket.emit("join_admin");

      toast.success("Real-time yangilanishlar yoqildi", {
        duration: 3000,
        id: "socket-connected",
      });
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket.IO aloqasi uzildi:", reason);
      this.isConnected = false;

      // Faqat server tomondan uzilgan bo'lsa xabar berish
      if (reason === "io server disconnect") {
        toast.error("Server bilan aloqa uzildi");
      }
    });

    this.socket.on("connect_error", (error) => {
      this.reconnectAttempts++;
      console.error(
        `Socket ulanish xatoligi (${this.reconnectAttempts}/${this.maxReconnectAttempts}):`,
        error.message
      );

      // Faqat birinchi marta va oxirgi marta xabar berish
      if (this.reconnectAttempts === 1) {
        console.log("Socket ulanishda muammo, qayta urinilmoqda...");
      } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        toast.error("Real-time yangilanishlar ishlamaydi", {
          duration: 5000,
          id: "socket-failed",
        });
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`✅ Socket qayta ulandi (${attemptNumber} urinishdan keyin)`);
      this.reconnectAttempts = 0;
      toast.success("Aloqa qayta tiklandi", {
        duration: 3000,
        id: "socket-reconnected",
      });
    });

    this.socket.on("reconnect_failed", () => {
      console.error("❌ Socket qayta ulanish muvaffaqiyatsiz");
      toast.error("Real-time yangilanishlar ishlamaydi", {
        duration: 10000,
        id: "socket-failed",
      });
    });

    // Yangi sotuv
    this.socket.on("new_sale", (data) => {
      console.log("📢 Yangi sotuv:", data);
      store.dispatch(addNewSale(data.sale));

      const doctorName = `${data.sale.doctor?.firstName || ""} ${
        data.sale.doctor?.lastName || ""
      }`.trim();
      toast.success(`Yangi sotuv: Dr. ${doctorName || "Noma'lum"}`, {
        duration: 5000,
      });
    });

    // ERP ma'lumotlari yangilandi
    this.socket.on("erp_data_updated", (data) => {
      console.log("📢 ERP ma'lumotlari yangilandi:", data);
      toast.success("ERP ma'lumotlari yangilandi");
    });

    // Sinxronlash tugadi
    this.socket.on("sync_completed", (data) => {
      console.log("📢 Sinxronlash tugadi:", data);
      toast.success(
        `Sinxronlash tugadi: ${
          data.processedCount || data.totalRecords || 0
        } ta yozuv`,
        { duration: 5000 }
      );
    });

    // Sinxronlash xatosi
    this.socket.on("sync_error", (data) => {
      console.log("📢 Sinxronlash xatosi:", data);
      toast.error(`Sinxronlash xatosi: ${data.error}`, {
        duration: 8000,
      });
    });

    // Mahsulotlar yangilandi
    this.socket.on("products_updated", (data) => {
      console.log(
        "📢 Mahsulotlar yangilandi:",
        data.products?.length || 0,
        "ta"
      );
      toast.info(`${data.products?.length || 0} ta mahsulot yangilandi`);
    });

    // Sinxronlash holati yangilandi
    this.socket.on("sync_update", (data) => {
      console.log("📢 Sinxronlash holati:", data.status);
    });

    // Sync status updates (yangi)
    this.socket.on("sync_status_update", (data) => {
      console.log("📢 Sinxronlash holati yangilandi:", data);
    });

    this.socket.on("sync_status_error", (data) => {
      console.error("📢 Sinxronlash holati xatoligi:", data);
    });
  }

  disconnect() {
    if (this.socket) {
      console.log("Socket aloqasi uzilmoqda...");
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;

      // Toast ni tozalash
      toast.dismiss("socket-connected");
      toast.dismiss("socket-reconnected");
      toast.dismiss("socket-failed");
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`Socket ulangan emas, event yuborilmadi: ${event}`);
    }
  }

  // Sinxronlash holatini so'rash
  requestSyncStatus() {
    if (this.socket?.connected) {
      this.socket.emit("request_sync_status");
    }
  }

  // Ulanish holatini olish
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socket: !!this.socket,
      socketConnected: this.socket?.connected || false,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
    };
  }

  // Qayta ulanishga majbur qilish
  forceReconnect() {
    console.log("Majburiy qayta ulanish...");
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 1000);
  }
}

export const socketService = new SocketService();
