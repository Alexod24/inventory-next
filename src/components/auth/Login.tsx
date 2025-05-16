"use client";
import { useState } from "react";
import Caja from "@/components/form/input/Caja";
import Input from "@/components/form/input/Input";
import Label from "@/components/form/Label";
// import Boton from "@/components/ui/boton/Boton";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
// import { useRouter } from "next/navigation"; // Importa useRouter para redirección
import { logIn } from "@/app/actions/auth";

export default function IniciarSesion() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  // const [email, setEmail] = useState(""); 
  // const [password, setPassword] = useState(""); 
  const [error] = useState(""); 
  // const router = useRouter(); 

  
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
            {/* AQUI EMPIEZA EL FORM */}
            <form>
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
                      type="password"
                      placeholder="Ingresa tu contraseña"                      
                      
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
                  <div className="flex items-center gap-3">
                    <Caja checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Recordarme siempre
                    </span>
                  </div>
                  <Link
                    href="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Olvidaste tu contraseña?
                  </Link>
                </div>
                <div>
                  {/* <Boton className="w-full" size="sm">
                    Iniciar Sesion
                  </Boton> */}
                  <button
          formAction={logIn}
          className="p-2 bg-blue-800 h-10 pointer hover:bg-blue-700 transition-all rounded-sm flex items-center justify-center text-white font-bold w-full"
        >
          Iniciar sesion
        </button>
                </div>
                {/* Mostrar el error si ocurre */}
                {error && (
                  <div className="text-red-500 text-sm mt-2 text-center">
                    {error}
                  </div>
                )}
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                No tienes una cuenta?{" "}
                <Link
                  href="/register"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Crea una
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

