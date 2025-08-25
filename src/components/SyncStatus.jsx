// src/components/SyncStatus.jsx - Sinxronlash holatini ko'rsatish
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sync,
  CheckCircle,
  AlertCircle,
  Clock,
  Database,
  RefreshCw,
} from "lucide-react";
import {
  autoSyncService,
  osonKassaService,
} from "../services/osonKassaService";
import Badge from "./UI/Badge";
import { formatDateTime } from "../utils/helpers";

const SyncStatus = ({ compact = false }) => {
  const [syncStatus, setSyncStatus] = useState(autoSyncService.getStatus());
  const [syncStats, setSyncStats] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    // Boshlang'ich statistikani olish
    loadSyncStats();

    // AutoSync holatini kuzatish
    const handleSyncEvent = (data) => {
      setSyncStatus(autoSyncService.getStatus());

      if (data.type === "sync_progress") {
        setProgress(data);
      } else if (data.type === "sync_completed" || data.type === "sync_error") {
        setProgress(null);
        loadSyncStats();
      }
    };

    autoSyncService.addCallback(handleSyncEvent);

    // Har 30 sekundda statistikani yangilash
    const interval = setInterval(() => {
      setSyncStatus(autoSyncService.getStatus());
      if (!syncStatus.isSyncing) {
        loadSyncStats();
      }
    }, 30000);

    return () => {
      autoSyncService.removeCallback(handleSyncEvent);
      clearInterval(interval);
    };
  }, []);

  const loadSyncStats = async () => {
    try {
      const stats = await osonKassaService.getSyncStatistics();
      setSyncStats(stats);
    } catch (error) {
      console.error("Sync statistikasini olishda xatolik:", error);
    }
  };

  const getStatusColor = () => {
    if (syncStatus.isSyncing) return "info";
    if (!syncStatus.tokenStatus?.isValid) return "danger";
    if (syncStatus.isRunning) return "success";
    return "default";
  };

  const getStatusText = () => {
    if (syncStatus.isSyncing) return "Синхронизация...";
    if (!syncStatus.tokenStatus?.isValid) return "Нет соединения";
    if (syncStatus.isRunning) return "Активна";
    return "Остановлена";
  };

  const getStatusIcon = () => {
    if (syncStatus.isSyncing)
      return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (!syncStatus.tokenStatus?.isValid)
      return <AlertCircle className="w-4 h-4" />;
    if (syncStatus.isRunning) return <CheckCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <Badge variant={getStatusColor()} size="sm">
          {getStatusText()}
        </Badge>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Статус синхронизации</h3>
        </div>
        <Badge variant={getStatusColor()}>{getStatusText()}</Badge>
      </div>

      {/* Progress bar для активной синхронизации */}
      {progress && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>
              Страница {progress.current} из {progress.total}
            </span>
            <span>{progress.processed} товаров</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.round(
                  (progress.current / progress.total) * 100
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Интервал синхронизации</p>
          <p className="font-medium">{syncStatus.interval} мин</p>
        </div>
        <div>
          <p className="text-gray-500">Следующая синхронизация</p>
          <p className="font-medium">
            {syncStatus.nextSync || "Не запланирована"}
          </p>
        </div>
        {syncStats && (
          <>
            <div>
              <p className="text-gray-500">Товаров в базе</p>
              <p className="font-medium">
                {syncStats.currentProductCount || 0}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Поставщиков</p>
              <p className="font-medium">
                {syncStats.currentSupplierCount || 0}
              </p>
            </div>
          </>
        )}
        {syncStats?.lastSyncDate && (
          <div className="col-span-2">
            <p className="text-gray-500">Последняя синхронизация</p>
            <p className="font-medium">
              {formatDateTime(syncStats.lastSyncDate)}
            </p>
          </div>
        )}
      </div>

      {/* Token holati */}
      {syncStatus.tokenStatus && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Токен API:</span>
            <Badge
              variant={syncStatus.tokenStatus.isValid ? "success" : "danger"}
              size="sm"
            >
              {syncStatus.tokenStatus.isValid
                ? "Действителен"
                : "Недействителен"}
            </Badge>
          </div>
          {syncStatus.tokenStatus.expiresIn && (
            <p className="text-xs text-gray-500 mt-1">
              Истекает через {syncStatus.tokenStatus.expiresIn}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default SyncStatus;
