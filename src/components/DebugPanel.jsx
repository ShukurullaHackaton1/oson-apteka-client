// src/components/DebugPanel.jsx - Debug ma'lumotlar uchun
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bug,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  Server,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  osonKassaService,
  autoSyncService,
} from "../services/osonKassaService";
import { socketService } from "../services/socket";
import { syncAPI, healthAPI } from "../services/api";
import Button from "./UI/Button";
import Badge from "./UI/Badge";

const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [isTesting, setIsTesting] = useState(false);
  const [systemStatus, setSystemStatus] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadSystemStatus();
    }
  }, [isOpen]);

  const loadSystemStatus = async () => {
    try {
      const [socketStatus, syncServiceStatus, tokenStatus] = await Promise.all([
        Promise.resolve(socketService.getConnectionStatus()),
        Promise.resolve(autoSyncService.getStatus()),
        Promise.resolve(osonKassaService.getTokenStatus()),
      ]);

      setSystemStatus({
        socket: socketStatus,
        autoSync: syncServiceStatus,
        token: tokenStatus,
        lastCheck: new Date().toLocaleTimeString(),
      });
    } catch (error) {
      console.error("Sistem holatini olishda xatolik:", error);
    }
  };

  const runAllTests = async () => {
    setIsTesting(true);
    const results = {};

    // 1. Backend Health Check
    try {
      console.log("🔍 Backend health tekshirilmoqda...");
      const healthResponse = await healthAPI.check();
      results.backend = {
        success: true,
        message: "Backend ishlaydi",
        data: healthResponse.data,
      };
    } catch (error) {
      results.backend = {
        success: false,
        message: `Backend xatoligi: ${error.message}`,
        error: error.response?.status || error.code,
      };
    }

    // 2. Oson Kassa API Test
    try {
      console.log("🔍 Oson Kassa API tekshirilmoqda...");
      const osonTest = await osonKassaService.testConnection();
      results.osonKassa = osonTest;
    } catch (error) {
      results.osonKassa = {
        success: false,
        message: `Oson Kassa API xatoligi: ${error.message}`,
        error: error.code,
      };
    }

    // 3. Socket.IO Connection Test
    try {
      console.log("🔍 Socket.IO aloqasi tekshirilmoqda...");
      const socketStatus = socketService.getConnectionStatus();
      results.socket = {
        success: socketStatus.isConnected,
        message: socketStatus.isConnected
          ? "Socket ulangan"
          : "Socket ulanmagan",
        data: socketStatus,
      };
    } catch (error) {
      results.socket = {
        success: false,
        message: `Socket xatoligi: ${error.message}`,
        error: error.code,
      };
    }

    // 4. Sync Status Test
    try {
      console.log("🔍 Sinxronlash holati tekshirilmoqda...");
      const syncStatus = await syncAPI.getStatus();
      results.sync = {
        success: true,
        message: "Sinxronlash tizimi ishlaydi",
        data: syncStatus.data,
      };
    } catch (error) {
      results.sync = {
        success: false,
        message: `Sinxronlash xatoligi: ${error.message}`,
        error: error.response?.status || error.code,
      };
    }

    // 5. Database Connection (Backend orqali)
    try {
      console.log("🔍 Database aloqasi tekshirilmoqda...");
      const dbTest = await syncAPI.getStatistics();
      results.database = {
        success: true,
        message: "Database aloqasi ishlaydi",
        data: dbTest.data,
      };
    } catch (error) {
      results.database = {
        success: false,
        message: `Database xatoligi: ${error.message}`,
        error: error.response?.status || error.code,
      };
    }

    setTestResults(results);
    setIsTesting(false);
    await loadSystemStatus();
  };

  const handleForceReconnect = () => {
    socketService.forceReconnect();
    setTimeout(loadSystemStatus, 2000);
  };

  const handleTokenRefresh = async () => {
    try {
      setIsTesting(true);
      await osonKassaService.testCredentials();
      await loadSystemStatus();
    } catch (error) {
      console.error("Token yangilanmadi:", error);
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = (success) => {
    if (success === undefined)
      return <RefreshCw className="w-4 h-4 animate-spin" />;
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusColor = (success) => {
    if (success === undefined) return "info";
    return success ? "success" : "danger";
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg"
          icon={<Bug className="w-4 h-4" />}
        >
          Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl border border-gray-200 p-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Bug className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Debug Panel</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </div>

          {/* System Status */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Система</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span>Socket:</span>
                <Badge
                  variant={
                    systemStatus.socket?.isConnected ? "success" : "danger"
                  }
                  size="sm"
                >
                  {systemStatus.socket?.isConnected ? "Подключен" : "Отключен"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Auto-sync:</span>
                <Badge
                  variant={
                    systemStatus.autoSync?.isRunning ? "success" : "default"
                  }
                  size="sm"
                >
                  {systemStatus.autoSync?.isRunning ? "Активен" : "Остановлен"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>API Token:</span>
                <Badge
                  variant={systemStatus.token?.isValid ? "success" : "danger"}
                  size="sm"
                >
                  {systemStatus.token?.isValid
                    ? "Действителен"
                    : "Недействителен"}
                </Badge>
              </div>
              {systemStatus.lastCheck && (
                <div className="text-xs text-gray-500">
                  Обновлено: {systemStatus.lastCheck}
                </div>
              )}
            </div>
          </div>

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Тесты</h4>
              <div className="space-y-2">
                {Object.entries(testResults).map(([key, result]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="capitalize">{key}:</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(result.success)}
                      <Badge variant={getStatusColor(result.success)} size="sm">
                        {result.success ? "OK" : "ОШИБКА"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={runAllTests}
              loading={isTesting}
              size="sm"
              className="w-full"
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Запустить все тесты
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleForceReconnect}
                variant="outline"
                size="sm"
                icon={<Wifi className="w-3 h-3" />}
              >
                Reconnect
              </Button>
              <Button
                onClick={handleTokenRefresh}
                variant="outline"
                size="sm"
                loading={isTesting}
                icon={<Database className="w-3 h-3" />}
              >
                Refresh Token
              </Button>
            </div>
          </div>

          {/* Environment Info */}
          <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
            <div>
              API: {import.meta.env.VITE_API_URL || "http://localhost:3003/api"}
            </div>
            <div>Mode: {import.meta.env.MODE}</div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DebugPanel;
