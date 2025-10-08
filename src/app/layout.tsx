import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

import { AuthProvider } from "@/components/providers/auth-provider";
import { AuthHeader } from "@/components/layout/AuthHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sumar+ | Plataforma de Donaciones",
  description: "Conectamos corazones generosos con causas que transforman vidas. Únete a Sumar+ y haz la diferencia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AuthHeader />
          {children}
          <Toaster 
            position="top-right"
            richColors
            closeButton
          />
        </AuthProvider>
      </body>
    </html>
  );
}
