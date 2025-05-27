"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Si no hay usuario, redirigir al login
        router.push("/login");
      } else {
        // Redirigir según el rol del usuario
        if (user.role?.name === "ADMIN") {
          router.push("/metrics");
        } else {
          // Todos los demás roles van a la página de escaneo
          router.push("/scan");
        }
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return null; // La redirección se maneja en el useEffect
}
