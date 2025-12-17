import Registrarse from "@/components/auth/Register";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrarse | Sistema de Inventario",
  description: "Crea tu cuenta en StockMaster",
};

export default function RegisterPage() {
  return <Registrarse />;
}
