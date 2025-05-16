"use server";

import { createSupabaseClient } from "@/app/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// REGISTRARSE

export async function signUp(formData: FormData) {
  const supabase = await createSupabaseClient();
  const credentials = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    repeatPassword: formData.get("repeatPassword") as string,
  };

  // Si las contraseñas no coinciden les enviara error

  if (credentials.password !== credentials.repeatPassword) redirect("/nocoinciden");

  const { error } = await supabase.auth.signUp(credentials);
  if (error) redirect("/error");
  revalidatePath("/", "layout");
  redirect("/login");
}

// INICIAR SESION

export async function logIn(formData: FormData) {
  const supabase = await createSupabaseClient();
  const credentials = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

// Si las credenciales son falsas levantara esta alerta 

  const { error } = await supabase.auth.signInWithPassword(credentials);
  if (error) redirect("/credencialesfalsas");
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// SALIR

export async function logOut() {
  const supabase = await createSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) redirect("/error");
  revalidatePath("/", "layout");
  redirect("/");
}
