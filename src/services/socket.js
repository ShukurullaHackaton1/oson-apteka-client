import { io } from "socket.io-client";
import { store } from "../store/store";
import { addNewSale } from "../store/slices/salesSlice";
import { updateStats } from "../store/slices/dashboardSlice";
import toast from "react-hot-toast";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (this.socket?.connected) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    this.socket = io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
      auth: {
        token,
      },
      transports: ["websocket"],
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Socket.io ga ulanish muvaffaqiyatli");
      this.isConnected = true;
      this.socket.emit("join_admin");
      toast.success("Real-time yangilanishlar yoqildi");
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Socket.io aloqasi uzildi");
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket ulanish xatosi:", error);
      toast.error("Real-time yangilanishlar ishlamayapti");
    });

    // Yangi sotuv
    this.socket.on("new_sale", (data) => {
      store.dispatch(addNewSale(data.sale));
      toast.success(
        `Yangi sotuv: Dr. ${data.sale.doctor.firstName} ${data.sale.doctor.lastName}`
      );
    });

    // ERP ma'lumotlari yangilandi
    this.socket.on("erp_data_updated", (data) => {
      toast.success("ERP ma'lumotlari yangilandi");
    });

    // Manual sinxronizatsiya tugadi
    this.socket.on("manual_sync_completed", (data) => {
      toast.success(
        `Sinxronizatsiya tugadi: ${data.recordsUpdated} ta yozuv yangilandi`
      );
    });

    // Sinxronizatsiya xatosi
    this.socket.on("sync_error", (data) => {
      toast.error(`Sinxronizatsiya xatosi: ${data.error}`);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }
}

export const socketService = new SocketService();
