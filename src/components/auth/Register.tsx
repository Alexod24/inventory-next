"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signUp } from "@/app/actions/auth";
import {
  ArrowRight,
  Package,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

interface AlertState {
  visible: boolean;
  variant: "success" | "error" | "warning";
  title: string;
  message: string;
}

export default function Registrarse() {
  const [showPassword, setShowPassword] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<AlertState | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  // Handle URL errors
  useEffect(() => {
    if (urlError) {
      setTimeout(() => {
        setCurrentAlert({
          variant: "error",
          title: "Error de Registro",
          message: decodeURIComponent(urlError),
          visible: true,
        });
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete("error");
        router.replace(`?${newSearchParams.toString()}`, { scroll: false });
      }, 500);
    }
  }, [urlError, searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentAlert(null);

    // Validaciones básicas de cliente
    if (password !== repeatPassword) {
      setCurrentAlert({
        visible: true,
        variant: "error",
        title: "Contraseñas no coinciden",
        message: "Por favor asegúrate de que ambas contraseñas sean iguales.",
      });
      return;
    }

    if (password.length < 8) {
      setCurrentAlert({
        visible: true,
        variant: "error",
        title: "Contraseña débil",
        message: "La contraseña debe tener al menos 8 caracteres.",
      });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("repeatPassword", repeatPassword);
    formData.append("rol", "usuario"); // Default user role

    try {
      await signUp(formData);

      // Note: server action usually redirects, but if it doesn't:
      setCurrentAlert({
        visible: true,
        variant: "success",
        title: "¡Registro Iniciado!",
        message: "Por favor revisa tu correo para confirmar tu cuenta.",
      });
    } catch (e: any) {
      console.error("Register Client Error:", e);
      setLoading(false);

      if (e?.digest?.startsWith("NEXT_REDIRECT")) {
        console.log("Redirect caught");
        return;
      }

      setCurrentAlert({
        visible: true,
        variant: "error",
        title: "Error Inesperado",
        message: "No se pudo conectar con el servidor. Intenta de nuevo.",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-emerald-400/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] right-[20%] w-96 h-96 bg-blue-400/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <Link
          href="/"
          className="text-sm text-slate-500 hover:text-slate-800 mb-8 flex items-center gap-2 transition-colors font-medium w-fit"
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Volver al inicio
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 pt-10 relative overflow-hidden">
          {/* Top Color Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-blue-600" />

          <div className="mb-6 text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <UserPlus className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Crear Cuenta
            </h2>
            <p className="text-slate-500 mt-2 text-sm">
              Únete a StockMaster y gestiona tu inventario
            </p>
          </div>

          {/* Alerts */}
          {currentAlert && currentAlert.visible && (
            <div
              className={`mb-6 p-4 rounded-xl border flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 ${
                currentAlert.variant === "success"
                  ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                  : "bg-red-50 border-red-100 text-red-800"
              }`}
            >
              {currentAlert.variant === "success" ? (
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              )}
              <div className="text-sm">
                <p className="font-bold">{currentAlert.title}</p>
                <p>{currentAlert.message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block p-3 outline-none transition-all placeholder:text-slate-400"
                placeholder="Juan Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block p-3 outline-none transition-all placeholder:text-slate-400"
                placeholder="juan@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block p-3 outline-none transition-all placeholder:text-slate-400 pr-10"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Confirmar Contraseña
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block p-3 outline-none transition-all placeholder:text-slate-400"
                placeholder="Repite tu contraseña"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm px-5 py-3.5 text-center transition-all shadow-lg hover:shadow-slate-900/20 mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Registrarse <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/login"
                className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Inicia Sesión
              </Link>
            </p>
          </div>
        </div>
        <p className="text-center text-slate-400 text-xs mt-6">
          © {new Date().getFullYear()} StockMaster Systems
        </p>
      </div>
    </div>
  );
}
