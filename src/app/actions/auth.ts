// src/app/actions/auth.ts
"use server";

import { createServerSupabaseClient } from "@/lib/supabaseServerClient";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers"; // Necesario para obtener el origen en signUp

// REGISTRARSE (MODIFICADO para trim() en email y password y para formAction)
export async function signUp(formData: FormData) {
  // Eliminamos el tipo de retorno explícito aquí para que sea Promise<void> implícitamente
  console.log("--- INICIANDO SIGNUP SERVER ACTION ---");
  try {
    const supabase = await createServerSupabaseClient();

    const email = (formData.get("email") as string).trim();
    const password = (formData.get("password") as string).trim();
    const repeatPassword = (formData.get("repeatPassword") as string).trim();
    const nombre = (formData.get("nombre") as string).trim();
    const rol = ((formData.get("rol") as string) || "usuario").trim();

    console.log(
      "SignUp Action - Email procesado:",
      `'${email}'`,
      "Longitud:",
      email.length
    );

    // -------------------------------------------------------------------------
    // Validaciones básicas
    if (!email || !password || !repeatPassword || !nombre) {
      console.error("SignUp Error: Todos los campos son obligatorios.");
      // Redirige con mensaje de error
      redirect(
        `/register?error=${encodeURIComponent(
          "Todos los campos son obligatorios."
        )}`
      );
    }

    if (password !== repeatPassword) {
      console.error("SignUp Error: Las contraseñas no coinciden.");
      // Redirige con mensaje de error
      redirect(
        `/register?error=${encodeURIComponent("Las contraseñas no coinciden.")}`
      );
    }

    if (password.length < 8) {
      console.error(
        "SignUp Error: La contraseña debe tener al menos 8 caracteres."
      );
      // Redirige con mensaje de error
      redirect(
        `/register?error=${encodeURIComponent(
          "La contraseña debe tener al menos 8 caracteres."
        )}`
      );
    }

    // -------------------------------------------------------------------------
    // Crear usuario en Auth
    console.log(
      "SignUp: Intentando crear usuario en Supabase Auth con email:",
      email
    );
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Asegúrate de que esta URL sea accesible y apunte a tu /auth/confirm/route.ts
        // Se añade el casting a 'any' para resolver el error de tipo con 'headers()'
        emailRedirectTo: `${(headers() as any).get("origin")}/auth/confirm`,
      },
    });

    if (authError) {
      console.error(
        "SignUp Error: Fallo al registrar usuario en Auth:",
        authError.message
      );
      // Redirige con mensaje de error
      redirect(
        `/register?error=${encodeURIComponent(
          "Por favor, intenta con un correo válido o ya registrado."
        )}`
      );
    }

    const userId = authData.user?.id;
    if (!userId) {
      console.error(
        "SignUp Error: No se pudo obtener el ID del usuario creado de Auth."
      );
      // Redirige con mensaje de error
      redirect(
        `/register?error=${encodeURIComponent(
          "No se pudo obtener el id del usuario creado."
        )}`
      );
    }

    console.log(
      "SignUp: Usuario creado en Auth con ID:",
      userId,
      "Email:",
      email
    );

    // Insertar perfil de usuario en la tabla 'usuarios'
    const profileToInsert = {
      id: userId,
      nombre: nombre,
      rol: rol,
      email: email,
    };
    console.log(
      "SignUp: Intentando insertar perfil en la tabla 'usuarios' con datos:",
      profileToInsert
    );

    const { error: profileError } = await supabase
      .from("usuarios")
      .insert(profileToInsert);

    if (profileError) {
      console.error(
        "SignUp Error: Fallo al insertar perfil de usuario en la tabla 'usuarios':",
        profileError.message
      );
      // Redirige con mensaje de error
      redirect(
        `/register?error=${encodeURIComponent(
          "Error al completar el registro del perfil del usuario. Detalles: " +
            profileError.message
        )}`
      );
    }

    console.log(
      "SignUp: Perfil de usuario insertado exitosamente en 'usuarios' para ID:",
      userId
    );

    // -------------------------------------------------------------------------
    revalidatePath("/", "layout");
    // Redirección exitosa
    redirect("/register/check-email"); // Redirige a una página para que el usuario revise su correo
  } catch (e: any) {
    console.error(
      "SignUp CRÍTICO: Error inesperado en la Server Action:",
      e.message,
      e
    );
    // Redirección en caso de error crítico
    redirect(
      `/register?error=${encodeURIComponent(
        "Ocurrió un error inesperado durante el registro."
      )}`
    );
  } finally {
    console.log("--- FINALIZANDO SIGNUP SERVER ACTION ---");
  }
}

// -------------------------------------------------------------------------
// INICIAR SESIÓN (MODIFICADO para Google reCAPTCHA y para formAction)
export async function logIn(formData: FormData) {
  // Eliminamos el tipo de retorno explícito aquí
  console.log("--- INICIANDO LOGIN SERVER ACTION ---");
  try {
    const supabase = await createServerSupabaseClient();

    const email = (formData.get("email") as string).trim();
    const password = (formData.get("password") as string).trim();
    const recaptchaToken = formData.get("recaptchaToken") as string | null;
    const captchaRequired = formData.get("captchaRequired") === "true";

    console.log("LogIn: Intentando iniciar sesión con email:", email);
    console.log("LogIn: CAPTCHA requerido por cliente:", captchaRequired);
    console.log("LogIn: reCAPTCHA Token recibido:", recaptchaToken);

    // Lógica de verificación de Google reCAPTCHA
    if (captchaRequired) {
      if (!recaptchaToken) {
        // Redirige con mensaje de error
        redirect(
          `/login?error=${encodeURIComponent(
            "Verificación reCAPTCHA requerida y no proporcionada."
          )}`
        );
      }

      const secretKey = process.env.RECAPTCHA_SECRET_KEY;
      if (!secretKey) {
        console.error(
          "RECAPTCHA_SECRET_KEY no configurada en el entorno del servidor."
        );
        // Redirige con mensaje de error
        redirect(
          `/login?error=${encodeURIComponent(
            "Error de configuración del CAPTCHA en el servidor."
          )}`
        );
      }

      const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;
      const recaptchaResponse = await fetch(verificationUrl, {
        method: "POST",
      });
      const recaptchaData = await recaptchaResponse.json();

      console.log("reCAPTCHA Verification Response:", recaptchaData);

      if (!recaptchaData.success) {
        console.error(
          "reCAPTCHA verification failed:",
          recaptchaData["error-codes"]
        );
        // Redirige con mensaje de error
        redirect(
          `/login?error=${encodeURIComponent(
            "Verificación reCAPTCHA fallida. Por favor, inténtalo de nuevo."
          )}`
        );
      }
    }

    const credentials = { email, password };
    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      console.error("LogIn Error: Fallo al iniciar sesión:", error.message);
      // Redirige con mensaje de error
      redirect(
        `/login?error=${encodeURIComponent(
          "Credenciales inválidas. Por favor, inténtalo de nuevo."
        )}`
      );
    }

    console.log("LogIn: Resultado de signInWithPassword:", data);

    if (!data.session) {
      console.error(
        "LogIn Error: Sesión no encontrada después del inicio de sesión."
      );
      // Redirige con mensaje de error
      redirect(
        `/login?error=${encodeURIComponent(
          "Sesión no establecida. Por favor, inténtalo de nuevo."
        )}`
      );
    }

    console.log("LogIn: Sesión activa con ID:", data.session.user.id);

    revalidatePath("/", "layout");
    // Redirección exitosa
    redirect("/base");
  } catch (e: any) {
    console.error(
      "LogIn CRÍTICO: Error inesperado en la Server Action:",
      e.message,
      e
    );
    // Redirección en caso de error crítico
    redirect(
      `/login?error=${encodeURIComponent(
        "Ocurrió un error inesperado durante el inicio de sesión."
      )}`
    );
  } finally {
    console.log("--- FINALIZANDO LOGIN SERVER ACTION ---");
  }
}

// SALIR (MODIFICADO para mayor robustez)
export async function logOut() {
  console.log("--- INICIANDO LOGOUT SERVER ACTION ---");
  let supabase;
  try {
    supabase = await createServerSupabaseClient();
    console.log("Logout: Supabase client created.");
  } catch (e: any) {
    console.error(
      "Logout Error: Fallo al crear el cliente Supabase:",
      e.message,
      e
    );
    redirect("/error?message=Failed to initialize Supabase client for logout");
  }

  if (!supabase || !supabase.auth) {
    console.error(
      "Logout Error: Supabase client o módulo de autenticación no definidos."
    );
    redirect(
      "/error?message=Supabase client or auth module missing for logout"
    );
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Logout Error: Fallo al cerrar sesión:", error.message);
    redirect("/error?message=" + encodeURIComponent(error.message));
  }

  console.log("Logout exitoso.");
  revalidatePath("/", "layout");
  redirect("/");
}
