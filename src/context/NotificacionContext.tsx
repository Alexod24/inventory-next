"use client";
import { createContext, useContext, useState, ReactNode } from "react";

// Definir la forma del contexto
interface NotificationContextType {
  notifications: string[];
  addNotification: (message: string) => void;
  removeNotification: (message: string) => void;
  clearNotifications: () => void;
}

// Valor inicial opcional: null (hasta que el provider envuelva la app)
const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
}

// Proveedor del contexto
export const NotificationProvider = ({
  children,
}: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<string[]>([]);

  const addNotification = (message: string) => {
    setNotifications((prev) =>
      prev.includes(message) ? prev : [...prev, message]
    );
  };

  const removeNotification = (message: string) => {
    setNotifications((prev) => prev.filter((msg) => msg !== message));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications debe usarse dentro de un NotificationProvider"
    );
  }
  return context;
};
