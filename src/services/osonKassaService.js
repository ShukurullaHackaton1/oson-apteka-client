// src/services/osonKassaService.js - Tuzatilgan versiya
import axios from "axios";
import { syncAPI } from "./api";

class OsonKassaService {
  constructor() {
    this.baseURL = "https://osonkassa.uz/api";
    this.token = localStorage.getItem("osonKassaToken");
    this.tokenExpiry = localStorage.getItem("osonKassaTokenExpiry");
    this.refreshPromise = null;
    this.credentials = {
      userName: "apteka",
      password: "00000",
      tenantId: "biofarms",
    };
  }

  // Tokenni tekshirish va yangilash
  async getValidToken() {
    // Agar token mavjud va muddat tugamagan bo'lsa
    if (
      this.token &&
      this.tokenExpiry &&
      Date.now() < parseInt(this.tokenExpiry)
    ) {
      return this.token;
    }

    // Agar refresh jarayoni allaqachon ketayotgan bo'lsa, uni kutamiz
    if (this.refreshPromise) {
      return await this.refreshPromise;
    }

    // Yangi token olish
    this.refreshPromise = this.refreshToken();
    const token = await this.refreshPromise;
    this.refreshPromise = null;
    return token;
  }

  // Yangi token olish - Login so'rovini to'g'ri formatda yuborish
  async refreshToken() {
    try {
      console.log("🔑 Oson Kassa token yangilanmoqda...");

      // Login API endpoint
      const loginUrl = `https://osonkassa.uz/api/auth/login`;

      const response = await axios.post(loginUrl, this.credentials, {
        timeout: 15000,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          tenantId: "biofarms",
        },
      });

      console.log("📡 Login API javobi:", response.status, response.statusText);

      if (response.data && response.data.token) {
        this.token = response.data.token;
        // Token 1 soat amal qiladi, lekin 50 daqiqada yangilaymiz (xavfsizlik uchun)
        this.tokenExpiry = Date.now() + 50 * 60 * 1000;

        // LocalStorage ga saqlash
        localStorage.setItem("osonKassaToken", this.token);
        localStorage.setItem(
          "osonKassaTokenExpiry",
          this.tokenExpiry.toString()
        );

        console.log("✅ Token muvaffaqiyatli olindi");
        console.log(
          `⏰ Token ${new Date(
            this.tokenExpiry
          ).toLocaleTimeString()} gacha amal qiladi`
        );

        return this.token;
      } else {
        throw new Error("API javobida token yo'q");
      }
    } catch (error) {
      console.error("❌ Login xatoligi:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      this.clearToken();

      // Xatolik turini aniqroq ko'rsatish
      if (error.response?.status === 400) {
        throw new Error("Login ma'lumotlari noto'g'ri (400 Bad Request)");
      } else if (error.response?.status === 401) {
        throw new Error("Autentifikatsiya xatoligi (401 Unauthorized)");
      } else if (error.response?.status === 403) {
        throw new Error("Ruxsat berilmagan (403 Forbidden)");
      } else if (error.code === "ECONNREFUSED") {
        throw new Error("Server bilan aloqa yo'q");
      } else if (error.code === "ENOTFOUND") {
        throw new Error("Server topilmadi (DNS xatoligi)");
      } else {
        throw new Error(`Noma'lum xatolik: ${error.message}`);
      }
    }
  }

  // Token ni tozalash
  clearToken() {
    this.token = null;
    this.tokenExpiry = null;
    localStorage.removeItem("osonKassaToken");
    localStorage.removeItem("osonKassaTokenExpiry");
  }

  // Test uchun login ma'lumotlarini tekshirish
  async testCredentials() {
    try {
      console.log("🔍 Login ma'lumotlari tekshirilmoqda...");

      // Token ni tozalash
      this.clearToken();

      // Yangi token olishga harakat qilish
      const token = await this.refreshToken();

      return {
        success: true,
        message: "Login ma'lumotlari to'g'ri",
        tokenReceived: !!token,
      };
    } catch (error) {
      return {
        success: false,
        message: `Login tekshirishda xatolik: ${error.message}`,
        error: error.message,
      };
    }
  }

  // Oson Kassa API ga so'rov yuborish
  async makeRequest(url, options = {}) {
    const maxRetries = 2; // Kamaytirildi
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const token = await this.getValidToken();

        const config = {
          ...options,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
            ...options.headers,
          },
          timeout: 30000,
          withCredentials: false,
        };

        const response = await axios(url, config);
        return response;
      } catch (error) {
        attempt++;

        console.error(`❌ API so'rov xatoligi (${attempt}/${maxRetries}):`, {
          url,
          status: error.response?.status,
          message: error.message,
        });

        if (error.response?.status === 401 && attempt < maxRetries) {
          console.log(`🔄 401 xatolik, token yangilanmoqda...`);
          this.clearToken();
          // Qisqa kutish vaqti
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
          continue;
        }

        // Oxirgi urinish yoki 401 emas
        throw error;
      }
    }
  }

  // Ma'lumotlarni bir sahifasini olish
  async fetchInventoryData(pageNumber = 1, pageSize = 50) {
    // pageSize kamaytirildi
    try {
      const url = `${this.baseURL}/report/inventory/remains`;
      const requestData = {
        pageNumber,
        pageSize,
        searchText: "",
        sortOrders: [
          {
            property: "product",
            direction: "asc",
          },
        ],
        source: 0,
        onlyActiveItems: true,
        manufacturerIds: [],
      };

      console.log(
        `📡 ${pageNumber}-sahifa so'ralmoqda (${pageSize} ta element)...`
      );

      const response = await this.makeRequest(url, {
        method: "POST",
        data: requestData,
      });

      if (!response.data || !response.data.page) {
        throw new Error("API dan noto'g'ri javob format");
      }

      const pageData = response.data.page;
      console.log(
        `✅ ${pageNumber}-sahifa olindi: ${
          pageData.items?.length || 0
        }/${pageSize} ta element`
      );

      return pageData;
    } catch (error) {
      console.error(
        `❌ ${pageNumber}-sahifani olishda xatolik:`,
        error.message
      );
      throw new Error(`Sahifa ${pageNumber} olinmadi: ${error.message}`);
    }
  }

  // Barcha ma'lumotlarni olish (kichikroq batch bilan)
  async fetchAllData(onProgress = null) {
    try {
      console.log("🔄 Ma'lumotlar yuklanmoqda...");

      // Birinchi sahifani olish
      const firstPage = await this.fetchInventoryData(1, 50);
      const allItems = [...(firstPage.items || [])];
      const totalPages = firstPage.totalPages || 1;
      const totalCount = firstPage.totalCount || 0;

      console.log(`📊 Jami ${totalPages} sahifa, ${totalCount} ta mahsulot`);

      // Progress callback
      if (onProgress) {
        onProgress({
          current: 1,
          total: totalPages,
          processed: allItems.length,
          totalItems: totalCount,
        });
      }

      // Agar sahifalar ko'p bo'lsa, faqat bir qismini olamiz (test uchun)
      const maxPages = Math.min(totalPages, 5); // Faqat 5 sahifa (test uchun)

      if (maxPages > 1) {
        for (let page = 2; page <= maxPages; page++) {
          try {
            console.log(`📦 ${page}-sahifa olinmoqda...`);
            const pageData = await this.fetchInventoryData(page, 50);

            if (pageData.items) {
              allItems.push(...pageData.items);
            }

            // Progress callback
            if (onProgress) {
              onProgress({
                current: page,
                total: maxPages,
                processed: allItems.length,
                totalItems: totalCount,
              });
            }

            // Sahifalar orasida kutish
            await new Promise((resolve) => setTimeout(resolve, 1500));
          } catch (error) {
            console.error(
              `❌ ${page}-sahifani olishda xatolik:`,
              error.message
            );
            // Boshqa sahifalar bilan davom etish
          }
        }
      }

      console.log(`✅ ${allItems.length} ta mahsulot yuklandi`);

      return {
        items: allItems,
        totalCount: totalCount,
        totalPages: totalPages,
        actualCount: allItems.length,
        success: true,
        limited: maxPages < totalPages, // Test rejimida cheklangan
      };
    } catch (error) {
      console.error("❌ Ma'lumotlarni olishda xatolik:", error.message);
      throw error;
    }
  }

  // Backend ga ma'lumot yuborish
  async sendDataToBackend(data) {
    try {
      console.log(
        `📤 ${data.items.length} ta mahsulot backend ga yuborilmoqda...`
      );

      const response = await syncAPI.fromFrontend(data);

      if (response.data.success) {
        console.log(
          `✅ Backend: ${response.data.processedCount} ta mahsulot qayta ishlandi`
        );
        return response.data;
      } else {
        throw new Error(response.data.message || "Backend xatolik qaytardi");
      }
    } catch (error) {
      console.error("❌ Backend ga ma'lumot yuborishda xatolik:", error);
      throw new Error(`Backend bilan aloqa xatoligi: ${error.message}`);
    }
  }

  // To'liq sinxronlash
  async fullSync(onProgress = null) {
    try {
      console.log("🔄 To'liq sinxronlash boshlandi...");

      // Avval login ma'lumotlarini tekshirish
      const testResult = await this.testCredentials();
      if (!testResult.success) {
        throw new Error(`Login muammosi: ${testResult.message}`);
      }

      // Ma'lumotlarni olish
      const data = await this.fetchAllData(onProgress);

      if (data.items.length === 0) {
        throw new Error("Hech qanday mahsulot olinmadi");
      }

      // Backend ga yuborish
      const result = await this.sendDataToBackend(data);

      console.log("✅ Sinxronlash muvaffaqiyatli tugadi:", result);
      return {
        ...result,
        fetchedItems: data.actualCount,
        totalAvailable: data.totalCount,
        limited: data.limited,
      };
    } catch (error) {
      console.error("❌ To'liq sinxronlashda xatolik:", error.message);
      throw error;
    }
  }

  // API holatini tekshirish
  async testConnection() {
    try {
      console.log("🔍 API aloqasi tekshirilmoqda...");

      const startTime = Date.now();

      // Avval login tekshirish
      const loginTest = await this.testCredentials();
      if (!loginTest.success) {
        return {
          success: false,
          message: "Login muvaffaqiyatsiz",
          error: loginTest.message,
        };
      }

      // Ma'lumot olishni sinab ko'rish
      const testPage = await this.fetchInventoryData(1, 1);
      const responseTime = Date.now() - startTime;

      return {
        success: true,
        message: "API aloqasi muvaffaqiyatli",
        responseTime: `${responseTime}ms`,
        itemsAvailable: testPage.totalCount || 0,
        pagesAvailable: testPage.totalPages || 0,
        tokenValid: !!this.token,
        tokenExpiry: this.tokenExpiry
          ? new Date(parseInt(this.tokenExpiry)).toLocaleString()
          : null,
      };
    } catch (error) {
      return {
        success: false,
        message: "API aloqasida xatolik",
        error: error.message,
        tokenValid: !!this.token,
      };
    }
  }

  // Token holatini olish
  getTokenStatus() {
    const now = Date.now();
    const expiry = parseInt(this.tokenExpiry);

    return {
      hasToken: !!this.token,
      isValid: this.token && this.tokenExpiry && now < expiry,
      isExpired: this.tokenExpiry ? now >= expiry : true,
      expiresAt: this.tokenExpiry ? new Date(expiry).toLocaleString() : null,
      expiresIn:
        this.tokenExpiry && now < expiry
          ? Math.round((expiry - now) / 60000) + " daqiqa"
          : null,
    };
  }

  // Sinxronlash statistikasini olish
  async getSyncStatistics() {
    try {
      const response = await syncAPI.getStatus();
      return response.data;
    } catch (error) {
      console.error("❌ Sinxronlash statistikasini olishda xatolik:", error);
      throw error;
    }
  }
}

// Singleton instance
export const osonKassaService = new OsonKassaService();

// Auto-sync service - kamroq tez-tez ishlaydigan qilingan
class AutoSyncService {
  constructor() {
    this.intervalId = null;
    this.timeoutId = null;
    this.isRunning = false;
    this.isSyncing = false;
    this.syncInterval = 15 * 60 * 1000; // 15 daqiqaga uzaytirildi
    this.callbacks = [];
    this.errorCount = 0;
    this.maxErrors = 3; // 3 marta xatolikdan keyin to'xtatish
  }

  // Callback qo'shish
  addCallback(callback) {
    this.callbacks.push(callback);
  }

  // Callback o'chirish
  removeCallback(callback) {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  }

  // Barcha callbacks ga xabar berish
  notifyCallbacks(data) {
    this.callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("❌ Callback xatoligi:", error);
      }
    });
  }

  // Avtomatik sinxronlashni boshlash
  start() {
    if (this.isRunning) {
      console.log("⚠️ Avtomatik sinxronlash allaqachon ishlab turibdi");
      return;
    }

    this.isRunning = true;
    this.errorCount = 0;
    console.log(
      `⏰ Avtomatik sinxronlash ishga tushirildi (har ${
        this.syncInterval / 60000
      } daqiqa)`
    );

    // 10 sekund kutib darhol sinxronlash
    this.timeoutId = setTimeout(() => {
      this.performSync();
    }, 10000); // 10 sekund kutish

    // Muntazam sinxronlash
    this.intervalId = setInterval(() => {
      this.performSync();
    }, this.syncInterval);

    this.notifyCallbacks({
      type: "started",
      interval: this.syncInterval / 60000,
    });
  }

  // Avtomatik sinxronlashni to'xtatish
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.isRunning = false;
    this.errorCount = 0;
    console.log("🛑 Avtomatik sinxronlash to'xtatildi");

    this.notifyCallbacks({
      type: "stopped",
    });
  }

  // Sinxronlash intervalini o'zgartirish
  setInterval(minutes) {
    this.syncInterval = minutes * 60 * 1000;

    if (this.isRunning) {
      this.stop();
      this.start();
    }

    console.log(`⏰ Sinxronlash intervali ${minutes} daqiqaga o'zgartirildi`);
  }

  // Sinxronlashni amalga oshirish
  async performSync() {
    if (this.isSyncing) {
      console.log("⚠️ Sinxronlash allaqachon ketayotgan, kutilmoqda...");
      return;
    }

    // Agar xatoliklar soni ko'p bo'lsa, to'xtatish
    if (this.errorCount >= this.maxErrors) {
      console.error(
        `❌ ${this.maxErrors} marta xatolikdan keyin avtomatik sinxronlash to'xtatildi`
      );
      this.stop();
      this.notifyCallbacks({
        type: "stopped_due_to_errors",
        errorCount: this.errorCount,
      });
      return;
    }

    this.isSyncing = true;
    const startTime = Date.now();

    try {
      console.log("⏰ Rejalashtirilgan sinxronlash boshlandi");

      this.notifyCallbacks({
        type: "sync_started",
        timestamp: new Date(),
      });

      const result = await osonKassaService.fullSync((progress) => {
        this.notifyCallbacks({
          type: "sync_progress",
          ...progress,
        });
      });

      const duration = Date.now() - startTime;
      this.errorCount = 0; // Muvaffaqiyatli bo'lganda xatoliklar sonini 0 ga qaytarish

      console.log(
        `✅ Rejalashtirilgan sinxronlash tugadi (${Math.round(
          duration / 1000
        )}s)`
      );

      this.notifyCallbacks({
        type: "sync_completed",
        result,
        duration,
        timestamp: new Date(),
      });
    } catch (error) {
      this.errorCount++;
      const duration = Date.now() - startTime;

      console.error(
        `❌ Rejalashtirilgan sinxronlashda xatolik (${this.errorCount}/${
          this.maxErrors
        }) (${Math.round(duration / 1000)}s):`,
        error.message
      );

      this.notifyCallbacks({
        type: "sync_error",
        error: error.message,
        errorCount: this.errorCount,
        maxErrors: this.maxErrors,
        duration,
        timestamp: new Date(),
      });
    } finally {
      this.isSyncing = false;
    }
  }

  // Qo'lda sinxronlash
  async manualSync() {
    this.errorCount = 0; // Qo'lda boshlanganda xatoliklar sonini 0 ga qaytarish
    return await this.performSync();
  }

  // Holat
  getStatus() {
    const tokenStatus = osonKassaService.getTokenStatus();

    return {
      isRunning: this.isRunning,
      isSyncing: this.isSyncing,
      interval: this.syncInterval / 60000,
      hasInterval: !!this.intervalId,
      nextSync: this.intervalId
        ? new Date(Date.now() + this.syncInterval).toLocaleTimeString()
        : null,
      tokenStatus,
      errorCount: this.errorCount,
      maxErrors: this.maxErrors,
    };
  }
}

export const autoSyncService = new AutoSyncService();
