"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
// Importa la función para obtener el cliente de navegador (que ahora estará hidratado)
import { getBrowserSupabaseClient } from "@/lib/supabaseBrowserClient";
import { logOut } from "@/app/actions/auth";
import { Desplegable } from "../ui/desplegable/Desplegable";
import { DesplegableItem } from "../ui/desplegable/DesplegableItem";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();

    async function fetchUserProfile() {
      console.log("🚀 [UserDropdown] Iniciando fetchUserProfile...");
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.log(
            "❌ [UserDropdown] Error/Info al obtener el usuario autenticado (probablemente no hay sesión):",
            userError.message
          );
          setUserName(null);
          setUserEmail(null);
        } else if (user) {
          console.log(
            "✅ [UserDropdown] Usuario autenticado encontrado:",
            user.id,
            user.email
          );
          // Corrección clave aquí: usa el operador ?? para convertir undefined a null
          setUserEmail(user.email ?? null);

          const { data: profile, error: profileError } = await supabase
            .from("usuarios")
            .select("nombre, rol")
            .eq("id", user.id)
            .single();

          if (profileError) {
            console.error(
              "❌ [UserDropdown] Error al obtener el perfil de usuario de la tabla 'usuarios':",
              profileError.message
            );
            setUserName("Usuario Desconocido");
            setUserRole(null);
          } else if (profile) {
            console.log(
              "✅ [UserDropdown] Datos de perfil encontrados:",
              profile
            );
            setUserName(profile.nombre);
            setUserRole(profile.rol);
          } else {
            console.warn(
              "⚠️ [UserDropdown] No se encontró perfil en la tabla 'usuarios' para el ID:",
              user.id
            );
            setUserName("Usuario sin perfil");
            setUserRole(null);
          }
        } else {
          console.log("🚫 [UserDropdown] No hay usuario autenticado.");
          setUserName(null);
          setUserEmail(null);
          setUserRole(null);
        }
      } catch (runtimeError) {
        console.error(
          "🛑 [UserDropdown] Error inesperado en fetchUserProfile:",
          runtimeError
        );
        setUserName("Error de Carga");
        setUserEmail("error@ejemplo.com");
        setUserRole(null);
      } finally {
        setLoadingProfile(false);
        setIsAuthChecked(true);
        console.log(
          "✅ [UserDropdown] fetchUserProfile finalizado. loadingProfile=false, isAuthChecked=true."
        );
      }
    }

    // El listener de onAuthStateChange seguirá funcionando y reaccionará a cambios
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(
          `🔑 [UserDropdown] Evento de autenticación: ${event}. Sesión:`,
          session
        );
        if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
          fetchUserProfile();
        }
      }
    );

    // Llama a fetchUserProfile inmediatamente para la carga inicial
    fetchUserProfile();

    return () => {
      console.log(
        "🧹 [UserDropdown] Limpiando useEffect del componente. Desuscribiendo."
      );
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function handleLogout() {
    logOut();
    closeDropdown();
  }

  if (!isAuthChecked) {
    return (
      <div className="relative">
        <button
          className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
          disabled
        >
          <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
            <Image
              width={44}
              height={44}
              src="/images/user/owner.jpg"
              alt="User"
            />
          </span>
          <span className="block mr-1 font-medium text-theme-sm">
            Cargando perfil...
          </span>
          <svg
            className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            width="18"
            height="20"
            viewBox="0 0 18 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <Image
            width={44}
            height={44}
            src="/images/user/owner.jpg"
            alt="User"
          />
        </span>

        <span className="block mr-1 font-medium text-theme-sm">
          {userName || "Invitado"}
        </span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Desplegable
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {userName || "Nombre de Usuario"}{" "}
            {userRole && (
              <span className="ml-1 text-xs text-gray-500">({userRole})</span>
            )}{" "}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {userEmail || "correo@ejemplo.com"}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          {/* Puedes añadir DesplegableItem aquí si los necesitas, por ejemplo: */}
          {/* <DesplegableItem href="/profile">Mi Perfil</DesplegableItem> */}
          {/* <DesplegableItem href="/settings">Configuración</DesplegableItem> */}
        </ul>
        <button
          onClick={handleLogout}
          className="p-2 bg-red-800 h-10 pointer hover:bg-red-700 transition-all rounded-sm flex items-center justify-center text-white font-bold w-full"
        >
          Salir
        </button>
      </Desplegable>
    </div>
  );
}
