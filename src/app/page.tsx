"use client"; // Habilita el modo cliente

import { useRouter } from "next/navigation"; // Cambia a `next/navigation`
import { useEffect } from "react";
import {supabase} from '../lib/supabaseClient'

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, [router]);

  useEffect (() => {
    const {data:suscripcion} = supabase.auth.onAuthStateChange((event, session)=>{
      if (!session) {
        router.push("/prueba")
      } else{
        router.push("/dashboard")
      }
    });

  // return () => {
  //   suscripcion?.unsubscripcion(); 
  // };
}, [router]);

  return null; 
}
