import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth, setAuthenticated, logout } from "../store/slices/authSlice";
import { socketService } from "../services/socket";
import { autoSyncService } from "../services/osonKassaService";
import toast from "react-hot-toast";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // Если токен есть, но пользователь не аутентифицирован, устанавливаем состояние
      if (!isAuthenticated) {
        dispatch(setAuthenticated());
        // Дополнительная проверка токена
        dispatch(checkAuth());
      }
    } else if (isAuthenticated) {
      // Если токена нет, но состояние показывает аутентификацию - выходим
      dispatch(logout());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      // Подключаем Socket.IO
      socketService.connect();

      // Настраиваем callbacks для автосинхронизации
      const handleSyncEvent = (data) => {
        switch (data.type) {
          case "started":
            console.log(
              `🚀 Автосинхронизация запущена (каждые ${data.interval} мин)`
            );
            toast.success(
              `Автосинхронизация включена (каждые ${data.interval} мин)`
            );
            break;
          case "sync_started":
            console.log("🔄 Синхронизация началась...");
            break;
          case "sync_progress":
            console.log(`📊 Прогресс: ${data.current}/${data.total} страниц`);
            break;
          case "sync_completed":
            console.log("✅ Синхронизация завершена:", data.result);
            toast.success(
              `Синхронизация завершена: ${data.result.processedCount} товаров`
            );
            break;
          case "sync_error":
            console.error("❌ Ошибка синхронизации:", data.error);
            toast.error(`Ошибка синхронизации: ${data.error}`);
            break;
          case "stopped":
            console.log("🛑 Автосинхронизация остановлена");
            break;
        }
      };

      autoSyncService.addCallback(handleSyncEvent);

      // Запускаем автоматическую синхронизацию
      autoSyncService.start();

      console.log("🚀 Пользователь аутентифицирован, сервисы запущены");
    } else {
      // Отключаем сервисы при выходе
      socketService.disconnect();
      autoSyncService.stop();

      console.log("🛑 Пользователь не аутентифицирован, сервисы остановлены");
    }

    return () => {
      socketService.disconnect();
      autoSyncService.stop();
    };
  }, [isAuthenticated]);

  return { user, isAuthenticated, isLoading };
};
