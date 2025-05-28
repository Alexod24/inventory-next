import IniciarSesion from "@/components/auth/Login";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesion | Sistema de Inventario",
  description: "Sistema de inventario por Alex",
};

export default function Login() {
  return <IniciarSesion />;
}
