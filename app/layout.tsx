import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/app/context/auth-context";
import { Header } from "@/app/components/header";

export const metadata: Metadata = {
  title: "DeporAr QR Scanner",
  description: "Sistema de escaneo de QR para gestión de pedidos de DeporAr",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
