import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Database,
  Bell,
  Shield,
  Globe,
  Recycle,
  Save,
  Eye,
  EyeOff,
  RefreshCw,
  TestTube,
} from "lucide-react";
import Button from "../components/UI/Button";
import Badge from "../components/UI/Badge";
import { syncAPI } from "../services/api";
import { osonKassaService } from "../services/osonKassaService";
import toast from "react-hot-toast";

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncInterval: 10,
    enableNotifications: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    language: "ru",
    timezone: "Asia/Tashkent",
    dateFormat: "DD.MM.YYYY",
    currency: "UZS",
  });

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const response = await syncAPI.getStatus();
      setSyncStatus(response.data);
    } catch (error) {
      console.error("Ошибка получения статуса синхронизации:", error);
    }
  };

  const tabs = [
    { id: "profile", name: "Профиль", icon: User },
    { id: "sync", name: "Синхронизация", icon: Database },
    { id: "notifications", name: "Уведомления", icon: Bell },
    { id: "system", name: "Система", icon: SettingsIcon },
    { id: "security", name: "Безопасность", icon: Shield },
  ];

  const handleProfileSave = async () => {
    setIsLoading(true);
    try {
      // Implement profile update API call
      toast.success("Профиль обновлен");
    } catch (error) {
      toast.error("Ошибка обновления профиля");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncTest = async () => {
    setIsLoading(true);
    try {
      const result = await syncAPI.testConnection();
      if (result.data.success) {
        toast.success("Соединение с API успешно");
      } else {
        toast.error("Ошибка соединения с API");
      }
    } catch (error) {
      toast.error("Ошибка тестирования соединения");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSync = async () => {
    setIsLoading(true);
    try {
      await osonKassaService.fullSync();
      toast.success("Синхронизация запущена");
      fetchSyncStatus();
    } catch (error) {
      toast.error("Ошибка синхронизации");
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Информация профиля
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Имя пользователя
            </label>
            <input
              type="text"
              value={profileData.username}
              onChange={(e) =>
                setProfileData({ ...profileData, username: e.target.value })
              }
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Роль
            </label>
            <input
              type="text"
              value={user?.role || "Администратор"}
              disabled
              className="input-field bg-gray-50"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Изменить пароль
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Текущий пароль
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={profileData.currentPassword}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    currentPassword: e.target.value,
                  })
                }
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Новый пароль
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={profileData.newPassword}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    newPassword: e.target.value,
                  })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Подтверждение пароля
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={profileData.confirmPassword}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    confirmPassword: e.target.value,
                  })
                }
                className="input-field"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleProfileSave}
          loading={isLoading}
          icon={<Save className="w-4 h-4" />}
        >
          Сохранить изменения
        </Button>
      </div>
    </div>
  );

  const renderSyncTab = () => (
    <div className="space-y-6">
      {/* Статус синхронизации */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Статус синхронизации
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Статус</p>
            <Badge
              variant={
                syncStatus?.status === "completed"
                  ? "success"
                  : syncStatus?.status === "syncing"
                  ? "info"
                  : syncStatus?.status === "error"
                  ? "danger"
                  : "default"
              }
            >
              {syncStatus?.status === "completed"
                ? "Завершено"
                : syncStatus?.status === "syncing"
                ? "Синхронизация"
                : syncStatus?.status === "error"
                ? "Ошибка"
                : "Неизвестно"}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-600">Последняя синхронизация</p>
            <p className="font-medium">
              {syncStatus?.lastSyncDate
                ? new Date(syncStatus.lastSyncDate).toLocaleString("ru-RU")
                : "Нет данных"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Товаров синхронизировано</p>
            <p className="font-medium">
              {syncStatus?.currentProductCount || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Настройки синхронизации */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Настройки синхронизации
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                Автоматическая синхронизация
              </p>
              <p className="text-sm text-gray-500">
                Автоматически синхронизировать данные с Oson Kassa
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={syncSettings.autoSync}
                onChange={(e) =>
                  setSyncSettings({
                    ...syncSettings,
                    autoSync: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Интервал синхронизации (минуты)
            </label>
            <select
              value={syncSettings.syncInterval}
              onChange={(e) =>
                setSyncSettings({
                  ...syncSettings,
                  syncInterval: parseInt(e.target.value),
                })
              }
              className="input-field max-w-xs"
            >
              <option value={5}>5 минут</option>
              <option value={10}>10 минут</option>
              <option value={15}>15 минут</option>
              <option value={30}>30 минут</option>
              <option value={60}>1 час</option>
            </select>
          </div>
        </div>
      </div>

      {/* Действия */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={handleManualSync}
          loading={isLoading}
          icon={<Recycle className="w-4 h-4" />}
        >
          Запустить синхронизацию
        </Button>
        <Button
          variant="outline"
          onClick={handleSyncTest}
          loading={isLoading}
          icon={<TestTube className="w-4 h-4" />}
        >
          Тест соединения
        </Button>
        <Button
          variant="outline"
          onClick={fetchSyncStatus}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Обновить статус
        </Button>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Системные настройки
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Язык системы
            </label>
            <select
              value={systemSettings.language}
              onChange={(e) =>
                setSystemSettings({
                  ...systemSettings,
                  language: e.target.value,
                })
              }
              className="input-field"
            >
              <option value="ru">Русский</option>
              <option value="uz">O'zbekcha</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Часовой пояс
            </label>
            <select
              value={systemSettings.timezone}
              onChange={(e) =>
                setSystemSettings({
                  ...systemSettings,
                  timezone: e.target.value,
                })
              }
              className="input-field"
            >
              <option value="Asia/Tashkent">Asia/Tashkent</option>
              <option value="Europe/Moscow">Europe/Moscow</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Формат даты
            </label>
            <select
              value={systemSettings.dateFormat}
              onChange={(e) =>
                setSystemSettings({
                  ...systemSettings,
                  dateFormat: e.target.value,
                })
              }
              className="input-field"
            >
              <option value="DD.MM.YYYY">DD.MM.YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Валюта
            </label>
            <select
              value={systemSettings.currency}
              onChange={(e) =>
                setSystemSettings({
                  ...systemSettings,
                  currency: e.target.value,
                })
              }
              className="input-field"
            >
              <option value="UZS">Узбекский сум (UZS)</option>
              <option value="USD">Доллар США (USD)</option>
              <option value="RUB">Российский рубль (RUB)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
          <p className="text-gray-600">Управление настройками системы</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-4 h-4 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="card">
            {activeTab === "profile" && renderProfileTab()}
            {activeTab === "sync" && renderSyncTab()}
            {activeTab === "system" && renderSystemTab()}
            {activeTab === "notifications" && (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  Настройки уведомлений будут доступны в ближайшее время
                </p>
              </div>
            )}
            {activeTab === "security" && (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  Настройки безопасности будут доступны в ближайшее время
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
