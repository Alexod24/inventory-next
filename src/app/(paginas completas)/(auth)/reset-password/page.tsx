// src/app/reset-password/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { createClientComponentClient } from "@/app/utils/supabase/browser"; // Ruta corregida
import Label from "@/components/form/Label"; // Ruta corregida
import Input from "@/components/form/input/Input"; // Ruta corregida
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Alert from "@/components/ui/alerta/AlertaExito"; // Ruta corregida
import ReactDOM from "react-dom"; // Importación necesaria para React Portals

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    visible: boolean;
    variant: "success" | "error" | "warning";
    title: string;
    message: string;
  } | null>(null);

  const supabase = createClientComponentClient();

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null); // Limpiar alertas anteriores

    // Asegúrate de que el email no esté vacío
    if (!email.trim()) {
      setAlert({
        visible: true,
        variant: "warning",
        title: "Correo Vacío",
        message: "Por favor, ingresa tu correo electrónico.",
      });
      setLoading(false);
      return;
    }

    try {
      // Llama a la función de Supabase para enviar el enlace de restablecimiento
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`, // <--- URL a la que redirigirá el enlace del correo
      });

      if (error) {
        console.error("Error al solicitar restablecimiento:", error.message);
        setAlert({
          visible: true,
          variant: "error",
          title: "Error al Enviar Enlace",
          message: `No pudimos enviar el enlace: ${error.message}. Por favor, verifica tu correo.`,
        });
      } else {
        setAlert({
          visible: true,
          variant: "success",
          title: "Enlace Enviado",
          message:
            "Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico. Por favor, revisa tu bandeja de entrada (y spam).",
        });
        setEmail(""); // Limpiar el campo de email
      }
    } catch (err: any) {
      console.error("Error inesperado:", err.message);
      setAlert({
        visible: true,
        variant: "error",
        title: "Error Inesperado",
        message:
          "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert(null), 7000); // Ocultar alerta después de 7 segundos
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Restablecer Contraseña
        </h2>
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Ingresa tu correo electrónico para recibir un enlace de
          restablecimiento.
        </p>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Enviando..." : "Enviar Enlace de Restablecimiento"}
          </Button>
        </form>
        <div className="text-center text-sm">
          <Link
            href="/login"
            className="text-amber-500 hover:text-yellow-500 dark:text-amber-400"
          >
            Volver al Login
          </Link>
        </div>
      </div>

      {/* Renderiza la alerta personalizada usando un Portal */}
      {alert &&
        alert.visible &&
        typeof document !== "undefined" &&
        ReactDOM.createPortal(
          <div className="fixed top-4 right-4 z-[99999]">
            <Alert
              variant={alert.variant}
              title={alert.title}
              message={alert.message}
              showLink={false}
            />
          </div>,
          document.body
        )}
    </div>
  );
}
