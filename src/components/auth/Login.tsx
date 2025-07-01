"use client"; // Asegúrate de que este componente sea un Client Component

import React, { useState, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { logIn } from "@/app/actions/auth"; // Tu Server Action de login
import ReCAPTCHA from "react-google-recaptcha";

// Importa tus componentes de UI
import Caja from "@/components/form/input/Caja";
import Input from "@/components/form/input/Input";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import Alert from "@/components/ui/alerta/AlertaExito"; // <--- IMPORTACIÓN DE TU COMPONENTE ALERT
import { useUser } from "@/context/UserContext"; // <--- NUEVA IMPORTACIÓN: useUser

export default function IniciarSesion() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estados para controlar las alertas
  const [currentAlert, setCurrentAlert] = useState<{
    visible: boolean;
    variant: "success" | "error" | "warning"; // Asumo que 'error' es un variant válido, si no, usa 'warning'
    title: string;
    message: string;
  } | null>(null);

  const [loading, setLoading] = useState(false); // Estado para el indicador de carga

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const MAX_FAILED_ATTEMPTS_BEFORE_CAPTCHA = 2;

  const router = useRouter();
  const { refreshUser } = useUser(); // <--- Obtén la función refreshUser del contexto

  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const onRecaptchaChange = (token: string | null) => {
    setRecaptchaValue(token);
    // Limpiar alerta si el CAPTCHA se resuelve
    if (token) {
      setCurrentAlert(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCurrentAlert(null); // Limpia cualquier alerta anterior
    setLoading(true); // Activa el indicador de carga

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const captchaIsVisible =
      failedAttempts >= MAX_FAILED_ATTEMPTS_BEFORE_CAPTCHA;
    if (captchaIsVisible) {
      if (!recaptchaSiteKey) {
        setCurrentAlert({
          visible: true,
          variant: "error", // O "warning" si "error" no es válido
          title: "Error de Configuración",
          message: "reCAPTCHA Site Key no está definida.",
        });
        setLoading(false);
        return;
      }
      if (!recaptchaValue) {
        setCurrentAlert({
          visible: true,
          variant: "warning",
          title: "Verificación Requerida",
          message: "Por favor, completa la verificación reCAPTCHA.",
        });
        setLoading(false);
        return;
      }
      formData.append("recaptchaToken", recaptchaValue);
      formData.append("captchaRequired", "true");
    } else {
      formData.append("captchaRequired", "false");
    }

    const result = await logIn(formData);

    // IMPORTANTE: Reiniciar el reCAPTCHA después de cada intento de envío
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
    setRecaptchaValue(null); // También limpia el estado interno del token

    if (result.success) {
      console.log("Login exitoso. Redirigiendo...");
      setFailedAttempts(0); // Reinicia los intentos fallidos al éxito
      setCurrentAlert({
        visible: true,
        variant: "success",
        title: "¡Inicio de Sesión Exitoso!",
        message: "Serás redirigido en breve.",
      });
      // Redirige después de un breve tiempo para que el usuario vea la alerta
      setTimeout(async () => {
        // <--- Hacemos el setTimeout async
        await refreshUser(); // Fuerza la recarga del usuario en el contexto
        router.push(result.redirectPath || "/base");
        // router.refresh(); // <--- ELIMINADO: Ya no es necesario aquí
      }, 1500);
    } else {
      setCurrentAlert({
        visible: true,
        variant: "error", // O "warning" si "error" no es válido
        title: "Error de Inicio de Sesión",
        message: result.error || "Ocurrió un error desconocido.",
      });

      if (result.error && result.error.includes("Credenciales inválidas")) {
        if (captchaIsVisible) {
          setFailedAttempts(1); // Reinicia a 1 intento fallido si el CAPTCHA ya estaba visible
        } else {
          setFailedAttempts((prev) => prev + 1); // Incrementa normalmente
        }
      } else if (result.error && result.error.includes("CAPTCHA")) {
        setFailedAttempts(MAX_FAILED_ATTEMPTS_BEFORE_CAPTCHA); // Mantiene el CAPTCHA visible
      } else {
        setFailedAttempts((prev) => prev + 1);
      }
    }
    setLoading(false); // Desactiva el indicador de carga
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Regresar al Menu
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Iniciar Sesion
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingresa tu correo y tu contraseña para ingresar
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Correo Electronico <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="alex@gmail.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <Label>
                    Contraseña <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.target.value)
                      }
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Aquí se muestra el Google reCAPTCHA condicionalmente */}
                {failedAttempts >= MAX_FAILED_ATTEMPTS_BEFORE_CAPTCHA && (
                  <div className="mt-4">
                    {recaptchaSiteKey ? (
                      <ReCAPTCHA
                        sitekey={recaptchaSiteKey}
                        onChange={onRecaptchaChange}
                        onExpired={() => setRecaptchaValue(null)}
                        onErrored={() => setRecaptchaValue(null)}
                        ref={recaptchaRef}
                      />
                    ) : (
                      <p className="text-red-500 text-sm">
                        Error: reCAPTCHA Site Key no configurada.
                      </p>
                    )}
                  </div>
                )}

                {/* Mensaje de intentos restantes */}
                {failedAttempts > 0 &&
                  failedAttempts < MAX_FAILED_ATTEMPTS_BEFORE_CAPTCHA && (
                    <p className="text-sm text-yellow-600 mb-4 text-center">
                      Credenciales inválidas. Te quedan{" "}
                      {MAX_FAILED_ATTEMPTS_BEFORE_CAPTCHA - failedAttempts}{" "}
                      intentos antes del CAPTCHA.
                    </p>
                  )}

                <div className="flex items-center justify-between">
                  <Link
                    href="/reset-password"
                    className="text-sm text-amber-500 hover:text-yellow-500 dark:text-amber-400"
                  >
                    Olvidaste tu contraseña?
                  </Link>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="p-2 bg-amber-500 h-10 pointer hover:bg-yellow-500 transition-all rounded-sm flex items-center justify-center text-white font-bold w-full"
                  >
                    {loading ? "Iniciando..." : "Iniciar Sesion"}
                  </button>
                </div>
                {/* Aquí se renderiza la alerta */}
                {currentAlert && currentAlert.visible && (
                  <div className="mt-4">
                    {" "}
                    {/* Contenedor para la alerta */}
                    <Alert
                      variant={currentAlert.variant}
                      title={currentAlert.title}
                      message={currentAlert.message}
                      showLink={false} // Asumo que no quieres enlaces en estas alertas
                    />
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
