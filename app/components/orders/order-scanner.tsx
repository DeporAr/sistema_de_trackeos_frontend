"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/auth-context";
import { useRouter } from "next/navigation";
import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";

interface Order {
  id: string;
  status: string;
  // ... otros campos de la orden
}

export default function OrderScanner() {
  const { user } = useAuth();
  const router = useRouter();
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (!detectedCodes.length) return;

    try {
      setScanning(false);
      setError(null);
      setSuccess("Código QR detectado. Procesando...");

      // Primero obtener los detalles de la orden
      const orderId = detectedCodes[0].rawValue;
      const orderResponse = await fetch(
        `https://incredible-charm-production.up.railway.app/orders/qr/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        },
      );

      if (!orderResponse.ok) {
        throw new Error("Error al obtener los detalles de la orden");
      }

      const orderData = await orderResponse.json();
      setOrderDetails(orderData);

      // Luego actualizar el estado de la orden
      const response = await fetch(
        `https://incredible-charm-production.up.railway.app/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            status: "PROCESSING", // o el estado que corresponda según el rol del usuario
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Error al actualizar el estado de la orden");
      }

      setSuccess("Orden actualizada correctamente");
      setTimeout(() => {
        setScanning(true);
        setSuccess(null);
        setOrderDetails(null);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al procesar el código QR",
      );
      setTimeout(() => {
        setScanning(true);
        setError(null);
        setOrderDetails(null);
      }, 2000);
    }
  };

  const handleError = (err: unknown) => {
    // Solo mostrar errores que no sean de "no se detectó código"
    if (
      err instanceof Error &&
      !err.message.includes("No barcode or QR code detected")
    ) {
      console.error("Error del escáner:", err);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Escanear Código QR</h1>

        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          {scanning ? (
            <div className="relative w-full aspect-square">
              <Scanner
                onScan={handleScan}
                onError={handleError}
                constraints={{
                  facingMode: "environment",
                }}
                components={{
                  finder: false,
                }}
                classNames={{
                  container: "w-full h-full",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "40%",
                  height: "40%",
                  border: "5px solid white",
                  borderRadius: "10px",
                  boxShadow: "0 0 0 100vmax rgba(0, 0, 0, 0.5)",
                }}
              ></div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Escáner pausado</p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {orderDetails && (
          <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
            <h2 className="text-lg font-semibold mb-2">Detalles de la Orden</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">ID:</span> {orderDetails.id}
              </p>
              <p>
                <span className="font-medium">Estado:</span>{" "}
                {orderDetails.status}
              </p>
              {/* Agregar más detalles según la estructura de la orden */}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Instrucciones</h2>
          <ul className="list-disc list-inside text-gray-600">
            <li>Asegúrate de que el código QR esté bien iluminado</li>
            <li>Mantén la cámara estable</li>
            <li>Coloca el código QR dentro del marco de la cámara</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
