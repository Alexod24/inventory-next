import PageBreadcrumb from "@/components/common/MigaPan";
import CheckboxComponents from "@/components/form/form-elements/Caja";
import DefaultInputs from "@/components/form/form-elements/InputDefault";
import DropzoneComponent from "@/components/form/form-elements/ZonaCaida";
import FileInputExample from "@/components/form/form-elements/EjemploEntrada";
import InputGroup from "@/components/form/form-elements/InputGrupos";
import InputStates from "@/components/form/form-elements/InputEstados";
import RadioButtons from "@/components/form/form-elements/BotonesRadio";
import SelectInputs from "@/components/form/form-elements/InputSeleccion";
import TextAreaInput from "@/components/form/form-elements/InputTexto";
import ToggleSwitch from "@/components/form/form-elements/InterruptorCambio";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Next.js Form Elements | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function Formulario() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Form Elements" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <DefaultInputs />
          <SelectInputs />
          <TextAreaInput />
          <InputStates />
        </div>
        <div className="space-y-6">
          <InputGroup />
          <FileInputExample />
          <CheckboxComponents />
          <RadioButtons />
          <ToggleSwitch />
          <DropzoneComponent />
        </div>
      </div>
    </div>
  );
}
