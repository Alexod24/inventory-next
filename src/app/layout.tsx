import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { NotificationProvider} from '@/context/NotificacionContext';
import { ThemeProvider } from '@/context/ThemeContext';

import NotificationDropdown from "@/components/header/NotificationDropdown";

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>
            <NotificationProvider>
              <NotificationDropdown />
              {children}
            </NotificationProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}