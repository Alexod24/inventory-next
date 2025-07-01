// src/components/auth/LoginForm.tsx
"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { logIn } from "@/app/actions/auth"; // Tu Server Action

// Simulación de un componente CAPTCHA simple para la demo
const CaptchaInput: React.FC<{ onCaptchaChange: (token: string) => void }> = ({
  onCaptchaChange,
}) => {
  return (
    <div className="mt-4">
      <label
        htmlFor="captcha"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Verificación de seguridad (CAPTCHA)
      </label>
      <input
        type="text"
        id="captcha"
        name="captchaToken" // Asegúrate de que el nombre coincida con formData.get("captchaToken")
        placeholder="Introduce el texto del CAPTCHA"
        onChange={(e) => onCaptchaChange(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
        required
      />
      <p className="text-xs text-gray-500 mt-1">
        Para esta demo, introduce "demo" para pasar el CAPTCHA. Introduce
        "INVALID_DEMO_TOKEN" para simular un fallo de CAPTCHA.
      </p>
    </div>
  );
};

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const MAX_FAILED_ATTEMPTS_BEFORE_CAPTCHA = 2; // Número de intentos fallidos antes de mostrar CAPTCHA

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const captchaIsVisible =
      failedAttempts >= MAX_FAILED_ATTEMPTS_BEFORE_CAPTCHA;
    if (captchaIsVisible) {
      formData.append("captchaToken", captchaToken || ""); // Envía el token si el CAPTCHA es visible
      formData.append("captchaRequired", "true"); // Indica al servidor que el CAPTCHA fue requerido por el cliente
    } else {
      formData.append("captchaRequired", "false"); // Indica que no fue requerido
    }

    const result = await logIn(formData);

    if (result.success) {
      console.log("Login exitoso. Redirigiendo...");
      setFailedAttempts(0); // Reinicia los intentos fallidos
      router.push(result.redirectPath || "/base");
    } else {
      console.error("Error de login:", result.error);
      setErrorMessage(result.error || "Ocurrió un error desconocido.");

      // Incrementar intentos fallidos solo si no es un error de CAPTCHA o si es un error de credenciales
      if (result.error && result.error.includes("Credenciales inválidas")) {
        setFailedAttempts((prev) => prev + 1);
      } else if (result.error && result.error.includes("CAPTCHA")) {
        // Si el CAPTCHA falló, no incrementamos intentos de credenciales,
        // pero aseguramos que el CAPTCHA siga visible.
        setFailedAttempts(MAX_FAILED_ATTEMPTS_BEFORE_CAPTCHA);
      } else {
        // Para otros errores inesperados, también incrementamos para forzar CAPTCHA
        setFailedAttempts((prev) => prev + 1);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Iniciar Sesión
        </h2>
        <form onSubmit={handleSubmit}>
          {errorMessage && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
            />
          </div>

          {failedAttempts >= MAX_FAILED_ATTEMPTS_BEFORE_CAPTCHA && (
            <CaptchaInput onCaptchaChange={setCaptchaToken} />
          )}

          {failedAttempts > 0 &&
            failedAttempts < MAX_FAILED_ATTEMPTS_BEFORE_CAPTCHA && (
              <p className="text-sm text-yellow-600 mb-4">
                Credenciales inválidas. Te quedan{" "}
                {MAX_FAILED_ATTEMPTS_BEFORE_CAPTCHA - failedAttempts} intentos
                antes del CAPTCHA.
              </p>
            )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-800"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
