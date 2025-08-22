"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Importa useSearchParams
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
  const searchParams = useSearchParams(); // Hook para leer parámetros de la URL
  const urlError = searchParams.get("error"); // Obtiene el parámetro 'error' de la URL

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const MAX_FAILED_ATTEMPTS_BEFORE_CAPTCHA = 2; // Número de intentos fallidos antes de mostrar CAPTCHA

  // Efecto para manejar errores de la URL
  useEffect(() => {
    if (urlError) {
      const decodedError = decodeURIComponent(urlError);
      setErrorMessage(decodedError);

      // Lógica para ajustar intentos fallidos/CAPTCHA basada en el mensaje de error
      if (decodedError.includes("Credenciales inválidas")) {
        setFailedAttempts((prev) => prev + 1);
      } else if (decodedError.includes("CAPTCHA")) {
        setFailedAttempts(MAX_FAILED_ATTEMPTS_BEFORE_CAPTCHA); // Asegura que el CAPTCHA siga visible
      } else {
        setFailedAttempts((prev) => prev + 1); // Para otros errores, también incrementa intentos
      }

      // Limpia el error de la URL después de mostrarlo
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("error");
      router.replace(`?${newSearchParams.toString()}`, { scroll: false });
    }
  }, [urlError, searchParams, router]);

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

    try {
      // Directamente llama a la Server Action.
      // La redirección (éxito o error) ocurrirá dentro de logIn.
      await logIn(formData);

      // Si la ejecución llega aquí, significa que la Server Action no redirigió.
      // Esto es un escenario inesperado para un flujo de login con Server Actions
      // que siempre debería redirigir.
      console.log(
        "Server Action 'logIn' completada sin redirección explícita."
      );
      // Forzamos una redirección por defecto si la acción no lo hizo
      router.push("/base");
    } catch (e: any) {
      // Este catch atrapará errores de red o errores lanzados por la Server Action
      // que NO sean redirecciones de Next.js (las redirecciones son manejadas por el router).
      console.error("Error en el envío del formulario (cliente):", e);
      setErrorMessage(
        "Ocurrió un error inesperado al intentar iniciar sesión."
      );
    } finally {
      setLoading(false);
      setCaptchaToken(null); // Limpia el token del CAPTCHA después del intento
    }
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
