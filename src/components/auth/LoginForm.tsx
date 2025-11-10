// "use client"; // Asegúrate de que este componente sea un Client Component

// import React, { useState, FormEvent, useRef, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation"; // Importa useSearchParams
// import { logIn } from "@/app/actions/auth"; // Tu Server Action de login
// import ReCAPTCHA from "react-google-recaptcha";

// // Importa tus componentes de UI
// import Caja from "@/components/form/input/Caja";
// import Input from "@/components/form/input/Input"; // Asegúrate de que este es el componente correcto si usas Input y Caja
// import Label from "@/components/form/Label";
// import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons"; // Asegúrate de que estas rutas de iconos son correctas
// import Link from "next/link";
// import Alert from "@/components/ui/alerta/AlertaExito"; // <--- IMPORTACIÓN DE TU COMPONENTE ALERT
// import { useUser } from "@/context/UserContext"; // <--- NUEVA IMPORTACIÓN: useUser

// interface AlertState {
//   visible: boolean;
//   variant: "success" | "error" | "warning";
//   title: string;
//   message: string;
// }

// export default function IniciarSesion() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   // Estados para controlar las alertas
//   const [currentAlert, setCurrentAlert] = useState<AlertState | null>(null);

//   const [loading, setLoading] = useState(false); // Estado para el indicador de carga

//   const [failedAttempts, setFailedAttempts] = useState(0);
//   const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);

//   const recaptchaRef = useRef<ReCAPTCHA>(null);

//   const MAX_FAILED_ATTEMPTS_BEFORE_CAPTCHA = 2;

//   const router = useRouter();
//   const searchParams = useSearchParams(); // Hook para leer parámetros de la URL
//   const urlError = searchParams.get("error"); // Obtiene el parámetro 'error' de la URL

//   const { refreshUser } = useUser(); // <--- Obtén la función refreshUser del contexto

//   const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

//   // Efecto para mostrar alertas basadas en el parámetro 'error' de la URL
//   // y para ajustar el estado de intentos fallidos/CAPTCHA
//   useEffect(() => {
//     if (urlError) {
//       const decodedError = decodeURIComponent(urlError);
//       setCurrentAlert({
//         variant: "error", // <-- CAMBIO CLAVE AQUÍ: 'type' cambiado a 'variant'
//         message: decodedError,
//         title: "Error de Inicio de Sesión",
//         visible: true,
//       });

//       if (decodedError.includes("Credenciales inválidas")) {
//         setFailedAttempts((prev) => {
//           const newAttempts = prev + 1;
//           if (newAttempts >= MAX_FAILED_ATTEMPTS_BEFORE_CAPTCHA) {
//             // Asegúrate de que setCaptchaRequired está definido si lo usas
//             // Si no, esta línea puede ser removida o el estado añadido
//             // setCaptchaRequired(true);
//           }
//           return newAttempts;
//         });
//       } else if (decodedError.includes("CAPTCHA")) {
//         // Asegúrate de que setCaptchaRequired está definido si lo usas
//         // setCaptchaRequired(true);
//       } else {
//         // Para otros errores no relacionados con credenciales/captcha, también podemos incrementar intentos
//         setFailedAttempts((prev) => prev + 1);
//       }

//       // Limpia el error de la URL después de mostrarlo para evitar que persista
//       const newSearchParams = new URLSearchParams(searchParams.toString());
//       newSearchParams.delete("error");
//       router.replace(`?${newSearchParams.toString()}`, { scroll: false });
//     }
//   }, [urlError, searchParams, router]);

//   // Determina si el CAPTCHA debe ser visible basado en los intentos fallidos
//   const captchaIsVisible = failedAttempts >= MAX_FAILED_ATTEMPTS_BEFORE_CAPTCHA;

//   const onRecaptchaChange = (token: string | null) => {
//     setRecaptchaValue(token);
//     // Limpiar alerta si el CAPTCHA se resuelve
//     if (token) {
//       setCurrentAlert(null);
//     }
//   };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault(); // Previene el envío por defecto del formulario HTML
//     setCurrentAlert(null); // Limpia cualquier alerta anterior
//     setLoading(true); // Activa el indicador de carga

//     const formData = new FormData();
//     formData.append("email", email);
//     formData.append("password", password);

//     // Añade el token de reCAPTCHA y el estado de captchaRequired al FormData
//     // Se envía 'true' si el CAPTCHA es visible en el cliente, de lo contrario 'false'
//     formData.append("captchaRequired", captchaIsVisible.toString());
//     if (captchaIsVisible) {
//       if (!recaptchaSiteKey) {
//         setCurrentAlert({
//           visible: true,
//           variant: "error",
//           title: "Error de Configuración",
//           message: "reCAPTCHA Site Key no está definida.",
//         });
//         setLoading(false);
//         return;
//       }
//       if (!recaptchaValue) {
//         setCurrentAlert({
//           visible: true,
//           variant: "warning",
//           title: "Verificación Requerida",
//           message: "Por favor, completa la verificación reCAPTCHA.",
//         });
//         setLoading(false);
//         return;
//       }
//       formData.append("recaptchaToken", recaptchaValue);
//     }

//     try {
//       // Directamente llama a la Server Action.
//       // La redirección (éxito o error) ocurrirá dentro de logIn.
//       await logIn(formData);

//       console.log(
//         "Server Action 'logIn' completada sin redirección explícita."
//       );
//       // Forzar recarga de usuario y redirección si no hubo error y no se redirigió
//       await refreshUser();
//       router.push("/base"); // Redirección por defecto si la acción no lo hizo
//     } catch (e: any) {
//       // Este catch atrapará errores de red o errores lanzados por la Server Action
//       // que NO sean redirecciones de Next.js (las redirecciones son manejadas por el router).
//       console.error("Error en el envío del formulario (cliente):", e);
//       setCurrentAlert({
//         visible: true,
//         variant: "error",
//         title: "Error de Conexión",
//         message:
//           "Ocurrió un error de red o inesperado. Por favor, inténtalo de nuevo.",
//       });
//     } finally {
//       setLoading(false);
//       // Reiniciar el reCAPTCHA después de cada intento de envío
//       if (recaptchaRef.current) {
//         recaptchaRef.current.reset();
//       }
//       setRecaptchaValue(null); // También limpia el estado interno del token
//     }
//   };

//   return (
//     <div className="flex flex-col flex-1 lg:w-1/2 w-full">
//       <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
//         <Link
//           href="/"
//           className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
//         >
//           <ChevronLeftIcon />
//           Regresar al Menu
//         </Link>
//       </div>
//       <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
//         <div>
//           <div className="mb-5 sm:mb-8">
//             <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
//               Iniciar Sesion
//             </h1>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Ingresa tu correo y tu contraseña para ingresar
//             </p>
//           </div>
//           <div>
//             {/* El formulario ahora usa onSubmit para manejar la lógica del cliente */}
//             <form onSubmit={handleSubmit}>
//               <div className="space-y-6">
//                 <div>
//                   <Label>
//                     Correo Electronico <span className="text-error-500">*</span>{" "}
//                   </Label>
//                   <Input
//                     id="email"
//                     name="email"
//                     type="email"
//                     placeholder="alex@gmail.com"
//                     value={email}
//                     onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//                       setEmail(e.target.value)
//                     }
//                     required
//                     disabled={loading}
//                   />
//                 </div>

//                 <div>
//                   <Label>
//                     Contraseña <span className="text-error-500">*</span>{" "}
//                   </Label>
//                   <div className="relative">
//                     <Input
//                       id="password"
//                       name="password"
//                       type={showPassword ? "text" : "password"}
//                       placeholder="Ingresa tu contraseña"
//                       value={password}
//                       onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//                         setPassword(e.target.value)
//                       }
//                       required
//                       disabled={loading}
//                     />
//                     <span
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
//                     >
//                       {showPassword ? (
//                         <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
//                       ) : (
//                         <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
//                       )}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Aquí se muestra el Google reCAPTCHA condicionalmente */}
//                 {captchaIsVisible && (
//                   <div className="mt-4">
//                     {recaptchaSiteKey ? (
//                       <ReCAPTCHA
//                         sitekey={recaptchaSiteKey}
//                         onChange={onRecaptchaChange}
//                         onExpired={() => setRecaptchaValue(null)}
//                         onErrored={() => setRecaptchaValue(null)}
//                         ref={recaptchaRef}
//                       />
//                     ) : (
//                       <p className="text-red-500 text-sm">
//                         Error: reCAPTCHA Site Key no configurada.
//                       </p>
//                     )}
//                   </div>
//                 )}

//                 {/* Mensaje de intentos restantes */}
//                 {failedAttempts > 0 &&
//                   failedAttempts < MAX_FAILED_ATTEMPTS_BEFORE_CAPTCHA && (
//                     <p className="text-sm text-yellow-600 mb-4 text-center">
//                       Credenciales inválidas. Te quedan{" "}
//                       {MAX_FAILED_ATTEMPTS_BEFORE_CAPTCHA - failedAttempts}{" "}
//                       intentos antes del CAPTCHA.
//                     </p>
//                   )}

//                 <div className="flex items-center justify-between">
//                   <Link
//                     href="/reset-password"
//                     className="text-sm text-amber-500 hover:text-yellow-500 dark:text-amber-400"
//                   >
//                     Olvidaste tu contraseña?
//                   </Link>
//                 </div>
//                 <div>
//                   <button
//                     type="submit"
//                     disabled={loading || (captchaIsVisible && !recaptchaValue)}
//                     className="p-2 bg-amber-500 h-10 pointer hover:bg-yellow-500 transition-all rounded-sm flex items-center justify-center text-white font-bold w-full"
//                   >
//                     {loading ? "Iniciando..." : "Iniciar Sesion"}
//                   </button>
//                 </div>
//                 {/* Aquí se renderiza la alerta */}
//                 {currentAlert && currentAlert.visible && (
//                   <div className="mt-4">
//                     <Alert
//                       variant={currentAlert.variant}
//                       title={currentAlert.title}
//                       message={currentAlert.message}
//                       showLink={false}
//                     />
//                   </div>
//                 )}
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
