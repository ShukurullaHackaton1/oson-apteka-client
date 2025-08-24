// src/components/Layout/Header.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Menu, Bell, User, LogOut, RefreshCw, Database } from "lucide-react";
import { logout } from "../../store/slices/authSlice";
import {
  triggerManualSync,
  fetchSyncStatus,
} from "../../store/slices/statisticsSlice";
import { motion } from "framer-motion";
import { formatDateTime } from "../../utils/helpers";
import toast from "react-hot-toast";

const Header = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { syncStatus, isSyncing } = useSelector((state) => state.statistics);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleSync = async () => {
    try {
      await dispatch(triggerManualSync()).unwrap();
      toast.success("Синхронизация запущена");

      // Обновляем статус через 2 секунды
      setTimeout(() => {
        dispatch(fetchSyncStatus());
      }, 2000);
    } catch (error) {
      toast.error("Ошибка синхронизации");
    }
  };

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: "info",
      message: "Новая поставка от GRAND PHARM",
      time: "5 мин назад",
    },
    {
      id: 2,
      type: "success",
      message: "Синхронизация завершена",
      time: "1 час назад",
    },
    {
      id: 3,
      type: "warning",
      message: "Заканчивается товар: Парацетамол",
      time: "2 часа назад",
    },
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h2 className="text-lg font-semibold text-gray-900">
            Система Управления Аптекой
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* Sync Status */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
            <Database className="w-4 h-4 text-gray-500" />
            <div className="text-sm">
              <p className="text-gray-600">
                {syncStatus?.status === "syncing"
                  ? "Синхронизация..."
                  : "Последняя синхр:"}
              </p>
              <p className="text-xs text-gray-500">
                {syncStatus?.lastSyncDate
                  ? formatDateTime(syncStatus.lastSyncDate)
                  : "Не выполнялась"}
              </p>
            </div>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">
              {isSyncing ? "Синхронизация..." : "Синхронизировать"}
            </span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
              >
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    Уведомления
                  </p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <p className="text-sm text-gray-900">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-gray-200">
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    Все уведомления
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium hidden md:block">
                {user?.username || "Администратор"}
              </span>
            </button>

            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
              >
                <div className="px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role === "admin" ? "Администратор" : user?.role}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Выйти
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
