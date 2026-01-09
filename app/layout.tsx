import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/app/context/auth-context";
import { Header } from "@/app/components/header";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Bebas_Neue } from "next/font/google";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

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
    <html lang="es" className={bebasNeue.variable}>
      <body>
        <AuthProvider>
          <Header />
          {children}
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  );
}
