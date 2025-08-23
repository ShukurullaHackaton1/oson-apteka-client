import { useEffect } from "react";
import { socketService } from "../services/socket";
import { useAuth } from "./useAuth";

export const useSocket = (event, callback) => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !socketService.socket) return;

    socketService.socket.on(event, callback);

    return () => {
      socketService.socket?.off(event, callback);
    };
  }, [event, callback, isAuthenticated]);
};
