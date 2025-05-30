import React, { useState, useEffect } from "react";

interface Option {
  value: string;
  label: string;
  id?: string; // Añadido para permitir id en cada opción
  customValue?: string; // Nuevo atributo para un valor personalizado
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string; // Valor inicial en caso de que no sea controlado
  value?: string; // Valor controlado externo
  name?: string;
  type?: string; // Aunque no es estándar para select, lo agrego por si quieres usarlo
  id?: string; // Añadido para permitir id en el select
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
  // Internamente, manejamos el estado solo si no se pasa `value`
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

  return (
    <select
      id={id} // Asignar el id al select
      name={name}
      {...(type ? { type } : {})} // Si pasas type, se agrega
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${
        value ?? internalValue
          ? "text-gray-800 dark:text-white/90"
          : "text-gray-400 dark:text-gray-400"
      } ${className}`}
      value={value ?? internalValue} // Usa `value` si es controlado, de lo contrario usa `internalValue`
      onChange={handleChange}
    >
      <option
        value=""
        disabled
        className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
      >
        {placeholder}
      </option>
      {options.map((option) => (
        <option
          key={option.value}
          id={option.id} // Asignar el id a cada opción si está disponible
          value={option.customValue || option.value} // Usar customValue si está disponible
          className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
