// src/app/update-password/page.tsx
"use client";

import { useState, FormEvent, useEffect } from "react";
import { createClientComponentClient } from "@/app/utils/supabase/browser"; // Ruta corregida
import Label from "@/components/form/Label"; // Ruta corregida
import Input from "@/components/form/input/Input"; // Ruta corregida
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Alert from "@/components/ui/alerta/AlertaExito"; // Ruta corregida
import { useRouter, useSearchParams } from "next/navigation"; // Estas son importaciones de Next.js, no deberían ser relativas
import ReactDOM from "react-dom"; // Importación necesaria para React Portals

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    visible: boolean;
    variant: "success" | "error" | "warning";
    title: string;
    message: string;
  } | null>(null);

  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // useEffect para verificar si la URL contiene los parámetros necesarios
  useEffect(() => {
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (!token_hash || !type) {
      // Si no hay token o tipo, redirigir al usuario a la página de solicitud de restablecimiento
      setAlert({
        visible: true,
        variant: "warning",
        title: "Enlace Inválido",
        message:
          "Este enlace de restablecimiento es inválido o ha caducado. Por favor, solicita uno nuevo.",
      });
      setTimeout(() => router.push("/reset-password"), 3000); // Redirige después de 3 segundos
    }
  }, [searchParams, router]);

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null); // Limpiar alertas anteriores

    if (password !== confirmPassword) {
      setAlert({
        visible: true,
        variant: "warning",
        title: "Contraseñas No Coinciden",
        message: "Las contraseñas no coinciden. Por favor, inténtalo de nuevo.",
      });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      // Supabase requiere al menos 6 caracteres por defecto
      setAlert({
        visible: true,
        variant: "warning",
        title: "Contraseña Corta",
        message: "La contraseña debe tener al menos 6 caracteres.",
      });
      setLoading(false);
      return;
    }

    try {
      // Supabase automáticamente detecta el token de la URL si se usa `updateUser`
      // en la página a la que redirige el enlace de restablecimiento.
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error("Error al actualizar contraseña:", error.message);
        setAlert({
          visible: true,
          variant: "error",
          title: "Error al Actualizar",
          message: `No pudimos actualizar tu contraseña: ${error.message}.`,
        });
      } else {
        setAlert({
          visible: true,
          variant: "success",
          title: "Contraseña Actualizada",
          message:
            "Tu contraseña ha sido actualizada exitosamente. ¡Ahora puedes iniciar sesión!",
        });
        setPassword("");
        setConfirmPassword("");
        // Redirigir al usuario al login después de un éxito
        setTimeout(() => router.push("/login"), 3000);
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
          Establecer Nueva Contraseña
        </h2>
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Ingresa y confirma tu nueva contraseña.
        </p>
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <Label htmlFor="password">Nueva Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repite tu nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar Contraseña"}
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
