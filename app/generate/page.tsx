"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import QrGenerator from "@/app/qr-generator";
import { Header } from "@/app/components/header";

export default function GeneratePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [generatedQr, setGeneratedQr] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (
      !isLoading &&
      user &&
      user.role !== "preparador" &&
      user.role !== "admin"
    ) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  const handleQrGenerated = (qrData: string) => {
    setGeneratedQr(qrData);
    // Aquí podrías hacer algo más con los datos del QR generado
    // como enviarlos a una API, mostrar una notificación, etc.
  };

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

  if (!user) {
    return null; // La redirección se maneja en el useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-2xl font-akira text-center mb-6 text-primary">
          GENERAR CÓDIGO QR
        </h1>

        <div className="max-w-3xl mx-auto">
          {user && (
            <QrGenerator
              onQrGenerated={handleQrGenerated}
              userId={user.id}
              userName={user.name}
              userRole={user.role}
            />
          )}
        </div>
      </main>
    </div>
  );
}
