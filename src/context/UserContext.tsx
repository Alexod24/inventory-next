"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface User {
  name: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  logOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error al obtener la sesión:", error);
        setUser(null);
      } else if (data?.session) {
        setUser({
          email: data.session.user.email,
          name: data.session.user.user_metadata?.nombre ?? "Usuario",
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setUser({
            email: session.user.email,
            name: session.user.user_metadata?.nombre ?? "Usuario",
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const logOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, logOut }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser debe ser usado dentro de UserProvider");
  }
  return context;
};
