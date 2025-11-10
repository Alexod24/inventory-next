"use server";

// 1. Importa el cliente de servidor (para verificar permisos)
import { createServerSupabaseClient } from "@/lib/supabaseServerClient";
// 2. Importa el 'createClient' estándar (para usar la Service Key)
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Esta es la nueva función que tu componente debe llamar
export async function createUserAsAdmin(formData: FormData) {
  console.log("Server Action 'createUserAsAdmin' iniciada.");

  // --- 1. Verificación de Seguridad: ¿Quién llama a esta acción? ---
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Error de permisos: No hay usuario autenticado.");
    throw new Error("No tienes permisos para realizar esta acción.");
  }

  // Verificamos en nuestra tabla 'usuarios' si el usuario es admin
  const { data: profile, error: profileError } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.rol !== "admin") {
    console.error(
      `Error de permisos: El usuario ${user.id} no es 'admin'. Rol: ${profile?.rol}`
    );
    throw new Error("Acción reservada solo para administradores.");
  }

  console.log(`Permisos validados: El usuario ${user.id} es 'admin'.`);

  // --- 2. Recolección de Datos del Formulario ---
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nombre = formData.get("nombre") as string;
  const rol = formData.get("rol") as string;

  // Validación simple (puedes añadir más)
  if (!email || !password || !nombre || !rol) {
    console.error("Error de formulario: Faltan datos.");
    throw new Error("Todos los campos son obligatorios.");
  }

  console.log(
    `Datos recibidos para nuevo usuario: Email: ${email}, Nombre: ${nombre}, Rol: ${rol}`
  );

  // --- 3. Creación del Usuario (Con Permisos de Admin) ---
  // ¡¡IMPORTANTE!! Usamos la 'service_role' key.
  // Esta debe estar en tus variables de entorno (.env.local)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // ¡Tu clave de servicio secreta!
  );

  // Paso 3.A: Crear el usuario en 'auth.users'
  console.log(`Intentando crear usuario en 'auth.users' para: ${email}`);
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirma el email
      // No podemos poner 'rol' o 'nombre' aquí directamente
      // porque 'layout.tsx' los lee de la tabla 'usuarios'
    });

  if (authError) {
    console.error("Error al crear usuario en 'auth.users':", authError.message);
    throw new Error(
      `Error de Supabase (Auth): ${authError.message}. ¿Quizás el email ya existe?`
    );
  }

  const newUserId = authData.user.id;
  console.log(`Usuario creado exitosamente en 'auth.users'. ID: ${newUserId}`);

  // Paso 3.B: Insertar el perfil en 'public.usuarios'
  // Tu 'layout.tsx' lee el 'rol' y 'nombre' de esta tabla,
  // por lo que este paso es CRUCIAL.
  console.log(`Insertando perfil en 'public.usuarios' para ID: ${newUserId}`);
  const { error: dbError } = await supabaseAdmin.from("usuarios").insert({
    id: newUserId, // El UUID del usuario que acabamos de crear
    nombre: nombre,
    rol: rol,
    email: email, // Opcional, pero bueno tenerlo
  });

  if (dbError) {
    console.error(
      `Error al insertar perfil en 'public.usuarios': ${dbError.message}`
    );
    // Opcional: Aquí podrías intentar borrar el usuario de 'auth.users' para limpiar.
    // await supabaseAdmin.auth.admin.deleteUser(newUserId);
    throw new Error(
      `Error de Supabase (DB): ${dbError.message}. El usuario de Auth fue creado, pero su perfil falló.`
    );
  }

  console.log(`¡Éxito! Perfil creado en 'public.usuarios' para ${newUserId}.`);

  // 4. Revalidar el path para que la tabla se actualice
  revalidatePath("/dashboard/usuarios"); // <-- Ajusta esta ruta a tu página de usuarios

  return {
    success: true,
    message: "Usuario creado exitosamente.",
    user: authData.user,
  };
}
