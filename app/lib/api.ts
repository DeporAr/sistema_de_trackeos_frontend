// Este archivo no existe en el proyecto original, lo creo para centralizar la lógica de la API.

import { useAuth } from "@/app/context/auth-context";

// Definimos una función que envuelve a fetch para interceptar las respuestas
export const fetchWithInterceptor = async (url: string, options: RequestInit) => {
  const { logout } = useAuth();

  const response = await fetch(url, options);

  if (response.status === 403) {
    const data = await response.json();
    if (data.description === "The JWT token has expired") {
      logout(); // Llama a la función de logout del contexto
      // La redirección se maneja en el contexto de autenticación
    }
  }

  return response;
};
