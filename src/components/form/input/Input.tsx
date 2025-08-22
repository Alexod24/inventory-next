import React, { FC, InputHTMLAttributes } from "react";

// Extendemos InputHTMLAttributes<HTMLInputElement> para heredar todas las propiedades HTML estándar de un input.
// Usamos Omit para excluir 'className' y 'type' de la extensión, ya que las definimos
// explícitamente en InputProps con un valor por defecto o un tipo más específico.
interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type"> {
  // Propiedades personalizadas o redefinidas
  className?: string; // Redefinimos className para darle un valor por defecto
  type?: "text" | "number" | "email" | "password" | "date" | "time" | string; // Redefinimos type para darle un valor por defecto y tipos específicos
  success?: boolean;
  error?: boolean;
  hint?: string; // Texto de pista opcional
}

const Input: FC<InputProps> = ({
  // Desestructuramos las propiedades personalizadas y las propiedades HTML comunes
  // que tienen valores por defecto o un manejo específico en este componente.
  type = "text",
  className = "",
  disabled = false,
  success = false,
  error = false,
  hint,
  // Capturamos todas las demás propiedades HTML estándar del input usando el operador rest.
  // Esto incluirá 'id', 'name', 'placeholder', 'value', 'defaultValue', 'onChange',
  // 'min', 'max', 'step', 'required', etc.
  ...rest
}) => {
  // Determina los estilos del input según el estado (disabled, success, error)
  let inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${className}`;

  // Añade estilos para los diferentes estados
  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    inputClasses += ` text-error-800 border-error-500 focus:ring-3 focus:ring-error-500/10  dark:text-error-400 dark:border-error-500`;
  } else if (success) {
    inputClasses += ` text-success-500 border-success-400 focus:ring-success-500/10 focus:border-success-300  dark:text-success-400 dark:border-success-500`;
  } else {
    inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800`;
  }

  return (
    <div className="relative">
      <input
        type={type}
        disabled={disabled}
        className={inputClasses}
        {...rest} // Pasa todas las demás propiedades HTML estándar al input nativo
      />

      {/* Texto de pista opcional */}
      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-error-500"
              : success
              ? "text-success-500"
              : "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;
