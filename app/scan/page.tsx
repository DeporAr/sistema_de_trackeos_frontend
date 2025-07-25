"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/auth-context";
import { UserRole } from "@/app/types/user";
import QrScanner from "@/app/components/qr/qr-scanner";
import QrDataDisplay from "@/app/components/qr/qr-data-display";
import OrderStatusUpdate from "@/app/components/orders/order-status-update";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Loader2 } from "lucide-react";
import { Camera } from "lucide-react";

interface OrderItem {
  id: string;
  description: string;
  quantity: number;
}

interface Order {
  id: string;
  status: string;
  products: OrderItem[];
  createdAt: string;
  updatedAt: string;
  shippingCode: string;
  orderCode: string;
  packageImageUrl?: string;
}

export default function ScanPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"scan" | "manual">("scan");
  const [scannedQrData, setScannedQrData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasProcessedQr, setHasProcessedQr] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scannerKey, setScannerKey] = useState(0);

  // Usamos refs para evitar que las funciones de useCallback se recreen constantemente
  const stateRef = useRef({ hasProcessedQr, isProcessing });
  stateRef.current = { hasProcessedQr, isProcessing };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const handleJwtError = useCallback(() => {
    localStorage.removeItem("authToken");
    logout();
    router.push("/login");
  }, [logout, router]);

  const fetchOrderData = useCallback(async (orderId: string) => {
    if (stateRef.current.hasProcessedQr) return;

    setIsProcessing(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch(
        `https://incredible-charm-production.up.railway.app/orders/qr/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (
          errorData.status === 403 &&
          errorData.detail?.includes("JWT expired")
        ) {
          handleJwtError();
          return;
        }
        throw new Error(errorData.error || "Error al obtener el pedido");
      }

      const data = await response.json();
      setOrder({
        ...data,
        orderCode: data.orderCode.toString(),
      });
      setHasProcessedQr(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al obtener el pedido",
      );
    } finally {
      setIsProcessing(false);
    }
  }, [handleJwtError]);

  const handleScan = useCallback(async (data: string) => {
    if (stateRef.current.hasProcessedQr || stateRef.current.isProcessing) {
      return;
    }
    console.log("Datos crudos del QR:", data);
    try {
      let orderId: string;
      try {
        // Parsear el JSON y extraer el ID
        const qrData = JSON.parse(data);
        orderId = qrData.id;
      } catch {
        // Si no es JSON, usar el dato crudo (para compatibilidad)
        orderId = data;
      }

      if (!orderId) {
        throw new Error("El código QR no contiene un ID válido.");
      }

      setScannedQrData(orderId);
      await fetchOrderData(orderId);
    } catch (err) {
      console.error("Error al procesar el código QR:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  }, [fetchOrderData]);

  const handleManualEntry = useCallback(async (orderId: string) => {
    if (stateRef.current.hasProcessedQr || stateRef.current.isProcessing) {
      return;
    }

    try {
      setScannedQrData(orderId);
      setIsProcessing(true);
      setError(null);

      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `https://incredible-charm-production.up.railway.app/orders/manual/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener el pedido manual");
      }

      const data = await response.json();
      setOrder({
        ...data,
        orderCode: data.orderCode.toString(),
      });
      setHasProcessedQr(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al obtener el pedido manual",
      );
    } finally {
      setIsProcessing(false);
    }
  }, [handleJwtError]);

  const handleReset = useCallback(() => {
    setScannedQrData(null);
    setOrder(null);
    setError(null);
    setHasProcessedQr(false);
    setSelectedImage(null);
    setPreviewUrl(null);
    stateRef.current.hasProcessedQr = false;
    setScannerKey(prevKey => prevKey + 1);
  }, []);

  const handleImageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleUploadImage = useCallback(async () => {
    if (!selectedImage || !order) return;

    setIsUploading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const formData = new FormData();
      formData.append("file", selectedImage);

      const response = await fetch(
        `https://incredible-charm-production.up.railway.app/api/volume/upload?order_id=${scannedQrData}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        if (response.status === 403) {
          handleJwtError();
          return;
        }
        const errorText = await response.text();
        throw new Error(
          "Ocurrió un error en el servidor al subir la imagen. Por favor, intente de nuevo más tarde.",
        );
      }

      const imageUrl = await response.text();

      setOrder(prevOrder =>
        prevOrder ? { ...prevOrder, packageImageUrl: imageUrl } : null,
      );

      alert("Imagen subida con éxito.");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ocurrió un error desconocido";
      setError(errorMessage);
      alert(`Error al subir la imagen: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      setSelectedImage(null);
    }
  }, [selectedImage, order, handleJwtError, scannedQrData]);

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

  const qrDataString = scannedQrData;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-2xl font-akira text-center mb-6">
          ESCANEAR CÓDIGO QR
        </h1>

        <div className="max-w-md mx-auto">
          {!qrDataString ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex border-b mb-4">
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === "scan"
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("scan")}
                >
                  Escanear QR
                </button>
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === "manual"
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-500"
                  }`}
                  onClick={() => setActiveTab("manual")}
                >
                  Carga Manual
                </button>
              </div>

              {activeTab === "scan" ? (
                <QrScanner key={scannerKey} onScan={handleScan} onClose={() => {}} />
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const input = form.elements.namedItem(
                      "manualOrderId",
                    ) as HTMLInputElement;
                    if (input.value.trim()) {
                      await handleManualEntry(input.value.trim());
                    }
                  }}
                  className="space-y-4"
                >
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="manualOrderId"
                  >
                    Ingresar ID del Pedido
                  </label>
                  <input
                    id="manualOrderId"
                    name="manualOrderId"
                    type="text"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-primary"
                    placeholder="Ej: ML-12345"
                    disabled={isProcessing}
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90 disabled:opacity-50"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Procesando..." : "Buscar Pedido"}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <QrDataDisplay qrData={qrDataString} />

              {isProcessing ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Cargando pedido...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              ) : (
                order && (
                  <Card className="border-primary/20">
                    <CardHeader className="border-b border-primary/10">
                      <CardTitle className="font-akira text-primary">
                        Pedido #{order.orderCode}
                      </CardTitle>
                      <div className="text-sm text-gray-500">
                        Fecha: {new Date(order.createdAt).toLocaleDateString()}
                        <span className="ml-2 px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {order.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {order.products && order.products.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Descripción
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Cantidad
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {order.products.map((item) => (
                                <tr key={item.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.id}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.description}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p>No hay productos en este pedido.</p>
                      )}

                      {qrDataString && user?.role && (
                        <OrderStatusUpdate
                          qrData={qrDataString}
                          onStatusChange={(updatedOrder) =>
                            setOrder(prevOrder =>
                              prevOrder ? { ...prevOrder, ...updatedOrder, products: prevOrder.products } : null
                            )
                          }
                          userRole={user.role}
                        />
                      )}

                      <div className="mt-6 border-t pt-4">
                        <Label htmlFor="package-image" className="font-medium text-gray-700">Imagen del Paquete</Label>
                        <div className="flex items-center gap-4 mt-2">
                          <Input
                            id="package-image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                            className="flex-1"
                          />
                          <Button onClick={handleUploadImage} disabled={!selectedImage || isUploading}>
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subir"}
                          </Button>
                        </div>
                        {previewUrl && (
                          <div className="mt-4">
                            <p className="text-sm font-medium">Vista previa:</p>
                            <img src={previewUrl} alt="Vista previa" className="max-w-xs rounded-md border mt-1" />
                          </div>
                        )}
                        {order.packageImageUrl && !previewUrl && (
                          <div className="mt-4">
                            <p className="text-sm font-medium">Imagen actual:</p>
                            <img src={order.packageImageUrl} alt="Imagen del paquete" className="max-w-xs rounded-md border mt-1" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              )}

              <div className="flex justify-center mt-6">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Escanear otro código
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
