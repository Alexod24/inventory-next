"use client";
import { createContext, useContext, useState } from "react";

// Crear el contexto
const NotificationContext = createContext();

// Proveedor del contexto
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message) => {
    // Evitar duplicados
    setNotifications((prev) =>
      prev.includes(message) ? prev : [...prev, message]
    );
  };

  const removeNotification = (message) => {
    setNotifications((prev) => prev.filter((msg) => msg !== message));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification, clearNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useNotifications = () => useContext(NotificationContext);
