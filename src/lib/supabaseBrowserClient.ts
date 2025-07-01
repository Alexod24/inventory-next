// src/lib/supabaseBrowserClient.ts
"use client"; // Marca explícitamente como Client Component

import { createBrowserClient } from "@supabase/ssr";

export function getBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
