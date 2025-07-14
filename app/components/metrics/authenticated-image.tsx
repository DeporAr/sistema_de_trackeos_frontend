"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface AuthenticatedImageProps {
  imageUrl: string;
  token: string | null;
}

export function AuthenticatedImage({ imageUrl, token }: AuthenticatedImageProps) {
  const [fetchedImageUrl, setFetchedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    const fetchImage = async () => {
      if (!imageUrl || !token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const fullUrl = `https://incredible-charm-production.up.railway.app${imageUrl}`;
        const response = await fetch(fullUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`No se pudo cargar la imagen (status: ${response.status})`);
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setFetchedImageUrl(objectUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageUrl, token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (fetchedImageUrl) {
    return <img src={fetchedImageUrl} alt="Imagen del paquete" className="rounded-lg max-w-full max-h-[80vh]" />;
  }

  return null;
}
