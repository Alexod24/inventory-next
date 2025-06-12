"use client";

import { Outfit } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";

const outfit = Outfit({
  subsets: ["latin"],
});

// Crea un componente que maneje la lógica del tema
function ThemedBody({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <body
      suppressHydrationWarning
      className={`${outfit.className} ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      }`}
    >
      {children}
    </body>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <ThemeProvider>
        <SidebarProvider>
          <UserProvider>
            <ThemedBody>{children}</ThemedBody>
          </UserProvider>
        </SidebarProvider>
      </ThemeProvider>
    </html>
  );
}
