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
        const fullUrl = imageUrl.startsWith("http")
          ? imageUrl
          : `https://incredible-charm-production.up.railway.app${imageUrl}`;

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
      <div className="flex flex-col items-center justify-center h-64 space-y-4 p-4 border rounded-lg bg-muted/20">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm text-muted-foreground">Cargando imagen...</p>
        <div className="text-xs text-muted-foreground text-center break-all">
          <p className="font-semibold">URL:</p>
          <p>{imageUrl || 'No se proporcionó URL'}</p>
          <p className="mt-2 font-semibold">Token:</p>
          <p>{token ? 'Presente' : 'Ausente'}</p>
        </div>
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
