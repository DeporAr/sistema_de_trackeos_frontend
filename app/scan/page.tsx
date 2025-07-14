"use client";

import { useState, useEffect, useRef } from "react";
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

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const handleJwtError = () => {
    // Limpiar el token y el estado
    localStorage.removeItem("authToken");
    logout();
    // Redirigir al login
    router.push("/login");
  };

  const fetchOrderData = async (orderId: string) => {
    if (hasProcessedQr) return;

    setIsProcessing(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      console.log("Llamando a la API con ID:", orderId);
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
        console.error("Error de la API:", errorData);

        // Verificar si es un error de JWT expirado
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
      console.log("Respuesta de la API:", data);
      setOrder({
        ...data,
        orderCode: data.orderCode.toString(),
      });
      setHasProcessedQr(true);
    } catch (error) {
      console.error("Error al obtener el pedido:", error);
      setError(
        error instanceof Error ? error.message : "Error al obtener el pedido",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScan = async (data: string) => {
    if (hasProcessedQr || isProcessing) {
      return;
    }

    try {
      console.log("Data del QR recibida:", data);

      // Intentar parsear el QR como JSON
      let orderId: string;
      try {
        const qrData = JSON.parse(data);
        orderId = qrData.orderId || qrData.id;
        console.log("ID extraído del QR:", orderId);
      } catch {
        // Si no es JSON, usar el string directamente
        orderId = data;
        console.log("Usando data directa como ID:", orderId);
      }

      setScannedQrData(data);
      await fetchOrderData(orderId);
    } catch (error) {
      console.error("Error al procesar el código QR:", error);
    }
  };

  const handleManualEntry = async (orderId: string) => {
    if (hasProcessedQr || isProcessing) {
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
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Error al obtener el pedido manual",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setScannedQrData(null);
    setOrder(null);
    setError(null);
    setHasProcessedQr(false);
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
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
      formData.append("orderId", order.id);

      const response = await fetch(
        "https://incredible-charm-production.up.railway.app/api/volume/upload",
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
        console.error("Server error on image upload:", errorText);
        throw new Error(
          "Ocurrió un error en el servidor al subir la imagen. Por favor, intente de nuevo más tarde.",
        );
      }

      const imageUrl = await response.text();

      setOrder(prevOrder =>
        prevOrder ? { ...prevOrder, packageImageUrl: imageUrl } : null,
      );

      alert("Imagen subida con éxito.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error desconocido";
      setError(errorMessage);
      alert(`Error al subir la imagen: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      setSelectedImage(null);
      setPreviewUrl(null);
    }
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

  // Asegurarnos de que scannedQrData sea un string antes de renderizar
  const qrDataString = scannedQrData
    ? typeof scannedQrData === "string"
      ? scannedQrData
      : JSON.stringify(scannedQrData)
    : null;

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
                <QrScanner onScan={handleScan} onClose={() => {}} />
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
                                <tr key={item.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.id}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.description}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.quantity}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          Este pedido no tiene productos asociados.
                        </div>
                      )}

                      {/* Sección para subir imagen */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-md font-semibold mb-4">Imagen del Paquete</h4>
                        {order.packageImageUrl ? (
                          <div>
                            <img src={order.packageImageUrl} alt="Imagen del paquete" className="rounded-md max-w-full h-auto" />
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center justify-center w-full">
                              <Label htmlFor="picture" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                {
                                  previewUrl ? (
                                    <img src={previewUrl} alt="Vista previa" className="h-full w-full object-contain" />
                                  ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                      <Camera className="w-8 h-8 mb-2 text-gray-500" />
                                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click para subir</span> o arrastra y suelta</p>
                                      <p className="text-xs text-gray-500">PNG, JPG (MAX. 800x400px)</p>
                                    </div>
                                  )
                                }
                                <Input id="picture" type="file" className="hidden" onChange={handleImageChange} accept="image/png, image/jpeg" ref={fileInputRef} />
                              </Label>
                            </div>
                            {selectedImage && (
                              <div className="flex justify-center">
                                <Button onClick={handleUploadImage} disabled={isUploading}>
                                  {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo...</> : "Subir Imagen"}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              )}

              {user && (
                <OrderStatusUpdate
                  qrData={qrDataString}
                  userRole={user.role}
                  userId={user.id.toString()}
                  userName={user.name}
                />
              )}

              <div className="flex justify-center">
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
