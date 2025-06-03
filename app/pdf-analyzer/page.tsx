"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { PdfAnalyzer } from "@/components/pdf-analyzer";

export default function PdfAnalyzerPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-2xl font-akira text-center mb-6">
          ANALIZADOR DE PDF
        </h1>

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <PdfAnalyzer />
        </div>
      </main>
    </div>
  );
}
