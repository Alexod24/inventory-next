import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
console.log(
  "Token de sesión en cliente:",
  localStorage.getItem("supabase.auth.token")
);
