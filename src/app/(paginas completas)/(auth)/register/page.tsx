import Registrarse from "@/components/auth/Register";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesion | Sistema de Inventario",
  description: "Sistema de inventario por Alex",
  // other metadata
};

export default function SignUp() {
  return <Registrarse/>;
}
