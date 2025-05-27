"use client";

import { useEffect } from "react";
import { Button } from "@/app/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error details:", error);
  }, [error]);

  // Función para obtener el mensaje de error de forma segura
  const getErrorMessage = (error: any): string => {
    try {
      if (typeof error === "string") {
        return error;
      }

      if (error instanceof Error) {
        return error.message || error.toString();
      }

      if (error && typeof error === "object") {
        // Si es un objeto con una propiedad message
        if (error.message) {
          return String(error.message);
        }

        // Si es un objeto con propiedades específicas
        if (error.id || error.name || error.description) {
          const details = [];
          if (error.name) details.push(`Nombre: ${error.name}`);
          if (error.id) details.push(`ID: ${error.id}`);
          if (error.description)
            details.push(`Descripción: ${error.description}`);
          return `Error: ${details.join(", ")}`;
        }

        // Si es cualquier otro objeto, convertirlo a string de forma segura
        try {
          return JSON.stringify(error, null, 2);
        } catch {
          return "Error: Objeto no serializable";
        }
      }

      return "Ha ocurrido un error inesperado";
    } catch (e) {
      return "Error al procesar el mensaje de error";
    }
  };

  const errorMessage = getErrorMessage(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Algo salió mal</h1>
        <div className="text-gray-600 mb-6 whitespace-pre-wrap break-words">
          {errorMessage}
        </div>
        <div className="space-x-4">
          <Button onClick={reset} className="bg-primary hover:bg-primary/90">
            Intentar nuevamente
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="border-primary/20 hover:bg-primary/10"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
