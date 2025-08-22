import { ComponentType } from "react";

export interface Option {
  value: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
}

export const opcionesEstado: Option[] = [
  { value: "bueno", label: "Bueno" },
  { value: "dañado", label: "Dañado" },
  { value: "roto", label: "Roto" },
];

export const opcionesDisponibilidad: Option[] = [
  { value: "ok", label: "Ok" }, // Usar true/false para la disponibilidad
  { value: "faltante", label: "Faltante" },
];
