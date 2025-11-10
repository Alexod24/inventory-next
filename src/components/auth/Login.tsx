"use client"; // Asegúrate de que este componente sea un Client Component

import React, { useState, FormEvent, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Importa useSearchParams
import { logIn } from "@/app/actions/auth"; // Tu Server Action de login
import Image from "next/image"; // Asegúrate de que este import esté aquí para el logo, si lo usas

// Importa tus componentes de UI
import Caja from "@/components/form/input/Caja";
import Input from "@/components/form/input/Input";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import Alert from "@/components/ui/alerta/AlertaExito";
import { useUser } from "@/context/UserContext"; // <--- IMPORTACIÓN CLAVE

interface AlertState {
  visible: boolean;
  variant: "success" | "error" | "warning";
  title: string;
  message: string;
}

export default function IniciarSesion() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentAlert, setCurrentAlert] = useState<AlertState | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const { user, refreshUser } = useUser();

  useEffect(() => {
    if (urlError) {
      if (user && user.id) {
        console.warn(
          "Se detectó un 'urlError' pero la sesión del usuario está activa. Ignorando error y redirigiendo al dashboard."
        );
        router.push("/base");
        return;
      }

      const decodedError = decodeURIComponent(urlError);
      setCurrentAlert({
        variant: "error",
        message: decodedError,
        title: "Error de Inicio de Sesión",
        visible: true,
      });

      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("error");
      router.replace(`?${newSearchParams.toString()}`, { scroll: false });
    }
  }, [urlError, searchParams, router, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCurrentAlert(null);
    setLoading(true); // <--- Inicia la carga

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      // 1. Llama a la Server Action
      await logIn(formData);

      // --- ¡ÉXITO! ---
      // Si llegamos aquí, logIn tuvo éxito y NO redirigió.

      // 2. Detiene la carga y actualiza el contexto de usuario
      setLoading(false); // <--- Detiene la carga
      await refreshUser();

      // 3. Muestra la alerta de éxito
      setCurrentAlert({
        visible: true,
        variant: "success",
        title: "¡Inicio de Sesión Exitoso!",
        message: "Serás redirigido al dashboard...",
      });

      // 4. Espera 1.5 segundos para que leas la alerta
      setTimeout(() => {
        router.push("/base"); // 5. Redirige al dashboard
      }, 1500); // 1.5 segundos
    } catch (e: any) {
      // --- ¡ERROR! ---
      console.error("Error en el envío del formulario (cliente):", e);
      setLoading(false); // <--- Detiene la carga en caso de error

      if (e && e.digest && e.digest.startsWith("NEXT_REDIRECT")) {
        // Esto es una redirección por ERROR (ej. credenciales inválidas)
        // Dejamos que el `useEffect` maneje la alerta de error
        console.log("Redirección de Server Action (error) capturada.");
      } else {
        // Esto es un error de red o inesperado
        setCurrentAlert({
          visible: true,
          variant: "error",
          title: "Error de Conexión",
          message:
            "Ocurrió un error de red o inesperado. Por favor, inténtalo de nuevo.",
        });
      }
    }
    // No usamos 'finally' para 'setLoading' porque necesitamos
    // controlarlo antes del 'setTimeout' en caso de éxito.
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
        <Link href="/" className="block mb-4">
          <Image
            width={120}
            height={48}
            src="/images/logo/labase.png" // Ajusta esta ruta si es necesario para tu logo
            alt="Logo de tu Empresa"
          />
        </Link>
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
                    disabled={loading}
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
                      disabled={loading}
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
                    disabled={loading} // Lógica de 'disabled' simplificada
                    className="p-2 bg-amber-500 h-10 pointer hover:bg-yellow-500 transition-all rounded-sm flex items-center justify-center text-white font-bold w-full"
                  >
                    {loading ? "Iniciando..." : "Iniciar Sesion"}
                  </button>
                </div>
                {currentAlert && currentAlert.visible && (
                  <div className="mt-4">
                    <Alert
                      variant={currentAlert.variant}
                      title={currentAlert.title}
                      message={currentAlert.message}
                      showLink={false}
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
