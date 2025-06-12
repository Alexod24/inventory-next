"use server";

import { createSupabaseClient } from "@/app/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// REGISTRARSE

export async function signUp(formData: FormData) {
  const supabase = await createSupabaseClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const repeatPassword = formData.get("repeatPassword") as string;
  const nombre = formData.get("nombre") as string;

  // -------------------------------------------------------------------------

  if (password !== repeatPassword) redirect("/nocoinciden");

  const { data: existingUser, error: fetchError } = await supabase
    .from("usuarios")
    .select("auth_user_id, email")
    .eq("email", email)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 = no rows found
    throw new Error("Error al buscar usuario: " + fetchError.message);
  }

  if (existingUser) {
    throw new Error("Este correo ya está registrado");
  }
  // -----------------------------------------------------------------------------------------------
  const { data: user, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error("Error al registrar usuario: " + error.message);
  }

  const userId = user.user?.id;

  if (!userId) {
    throw new Error("No se pudo obtener el id del usuario creado.");
  }

  // Guardar información adicional en la tabla `profiles`
  const { error: dbError } = await supabase.from("usuarios").insert({
    auth_user_id: userId,
    email,
    nombre,
  });

  if (dbError) {
    throw new Error("Error al guardar datos adicionales: " + dbError.message);
  }

  revalidatePath("/", "layout");
  redirect("/login");
}

// -------------------------------------------------------------------------
// INICIAR SESIÓN
export async function logIn(formData: FormData) {
  const supabase = await createSupabaseClient();

  const credentials = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  console.log("Intentando iniciar sesión con:", credentials);

  // Intenta iniciar sesión con las credenciales proporcionadas
  const { data, error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    console.error("Error iniciando sesión:", error.message);
    return redirect("/credencialesfalsas");
  }

  console.log("Resultado de signInWithPassword:", data);

  // Verifica si se estableció una sesión activa
  if (!data.session) {
    console.error("Sesión no encontrada después del inicio de sesión.");
    return redirect("/credencialesfalsas");
  }

  console.log("Sesión activa:", data.session);

  // Pausa breve para asegurar que las cookies se establecen
  await new Promise((resolve) => setTimeout(resolve, 200)); // Espera 200ms

  // Redirige al usuario a la página correspondiente
  redirect("/base-operativa");
}

// SALIR

export async function logOut() {
  const supabase = await createSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) redirect("/error");
  revalidatePath("/", "layout");
  redirect("/");
}
