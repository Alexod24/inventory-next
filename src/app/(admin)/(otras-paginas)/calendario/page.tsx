import Calendario from "@/components/calendario/Calendario";
import MigaPan from "@/components/common/MigaPan";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Calender | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Calender page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};
export default function page() {
  return (
    <div>
      <MigaPan pageTitle="Calendario" />
      <Calendario />
    </div>
  );
}
