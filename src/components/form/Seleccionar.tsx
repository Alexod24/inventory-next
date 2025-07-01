import React, { useState, useEffect } from "react";

interface Option {
  value: string | number; // CAMBIO CLAVE: Permite que 'value' sea string o number
  label: string;
  id?: string;
  customValue?: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string; // Valor controlado externo
  name?: string;
  type?: string;
  id?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value, // Prop para manejar el componente como controlado
  name,
  type,
  id, // Nuevo prop para el id del select
}) => {
  options = options || []; // Asegura que options sea un array
  const [internalValue, setInternalValue] = useState<string>(defaultValue);

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value); // Sincroniza el estado interno si `value` cambia externamente
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    if (value === undefined) {
      setInternalValue(newValue); // Actualiza solo si no es controlado externamente
    }
    onChange(newValue); // Notifica al componente padre
  };

  // El valor que se le pasa al elemento <select> de HTML debe ser una cadena.
  // Si 'value' o 'internalValue' son undefined/null, se usa una cadena vacía.
  const controlledHtmlValue = (value ?? internalValue ?? "").toString();

  return (
    <select
      id={id}
      name={name}
      {...(type ? { type } : {})}
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
        controlledHtmlValue
          ? "text-gray-800 dark:text-white/90"
          : "text-gray-400 dark:text-gray-400"
      } ${className}`}
      value={controlledHtmlValue} // Usa el valor controlado y asegurado como string
      onChange={handleChange}
    >
      <option
        value="" // Valor vacío para la opción de placeholder
        disabled
        className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
      >
        {placeholder}
      </option>
      {options.map((option) => (
        <option
          key={String(option.value)} // CAMBIO CLAVE: Asegura que la key sea siempre una cadena
          id={option.id}
          value={String(option.customValue || option.value)} // CAMBIO CLAVE: Asegura que el valor de la opción sea siempre una cadena
          className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
