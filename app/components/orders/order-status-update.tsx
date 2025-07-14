"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Label } from "@/app/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Define the order status types
export type OrderStatus =
  | "RECIBIDO"
  | "EN_PREPARACION"
  | "PREPARADO"
  | "EN_EMBALAJE"
  | "EMBALADO"
  | "EN_DESPACHO"
  | "DESPACHADO"
  | "ENTREGADO";

// Define user role type
export type UserRole =
  | "admin"
  | "preparador"
  | "embalador"
  | "despachador"
  | "recibidor";

interface Role {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Modificar el mapeo de roles a estados permitidos
const roleStatusMap: Record<UserRole, OrderStatus[]> = {
  admin: ["RECIBIDO", "EN_PREPARACION", "EMBALADO", "DESPACHADO", "ENTREGADO"],
  preparador: ["EN_PREPARACION", "EMBALADO"],
  embalador: ["EN_EMBALAJE", "EMBALADO"],
  despachador: ["EN_DESPACHO", "DESPACHADO", "ENTREGADO"],
  recibidor: ["RECIBIDO"],
};

// Status labels for display
const statusLabels: Record<OrderStatus, string> = {
  RECIBIDO: "Recibido",
  EN_PREPARACION: "En Preparación",
  PREPARADO: "Preparado",
  EN_EMBALAJE: "En Embalaje",
  EMBALADO: "Embalado",
  EN_DESPACHO: "En Despacho",
  DESPACHADO: "Despachado",
  ENTREGADO: "Entregado",
};

interface OrderStatusUpdateProps {
  qrData: string;
  userRole: Role;
  userId: string;
  userName: string;
}

export default function OrderStatusUpdate({
  qrData,
  userRole,
  userId,
  userName,
}: OrderStatusUpdateProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(
    null,
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasProcessedQr, setHasProcessedQr] = useState(false);

  // Convertir el nombre del rol a minúsculas para el mapeo
  const normalizedRole = userRole.name.toLowerCase() as UserRole;

  // Get allowed statuses for this user role
  const allowedStatuses = roleStatusMap[normalizedRole] || [];

  // Los estados permitidos se obtienen del mapeo de roles

  const handleJwtError = () => {
    // Limpiar el token
    localStorage.removeItem("authToken");
    // Redirigir al login
    router.push("/login");
  };

  const updateStatus = async () => {
    if (!selectedStatus || hasProcessedQr) return;

    setIsUpdating(true);
    setIsSuccess(false);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      // Extraer el ID del pedido del QR
      let orderId: string;
      try {
        const qrDataObj = JSON.parse(qrData);
        orderId = qrDataObj.orderId || qrDataObj.id;
      } catch {
        orderId = qrData;
      }

      // Llamada a la API para actualizar el estado
      const requestBody = {
        orderStatus: selectedStatus,
        userId,
        userName,
        userRole: normalizedRole,
      };
      console.log("Enviando petición con body:", requestBody);

      const response = await fetch(
        `https://incredible-charm-production.up.railway.app/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
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

        throw new Error(errorData.error || "Error al actualizar el estado");
      }

      const responseData = await response.json();
      console.log("Respuesta de la API:", responseData);

      setIsSuccess(true);
      setHasProcessedQr(true);
    } catch (error) {
      console.error("Error updating status:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error al actualizar el estado",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Resetear el estado cuando cambia el QR
  useEffect(() => {
    setSelectedStatus(null);
    setIsSuccess(false);
    setErrorMessage(null);
    setHasProcessedQr(false);
  }, [qrData]);

  if (allowedStatuses.length === 0) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="border-b border-primary/10">
          <CardTitle className="font-akira text-primary">
            Actualizar Estado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Tu rol no tiene permisos para actualizar estados de pedidos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="border-b border-primary/10">
        <CardTitle className="font-akira text-primary">
          Actualizar Estado del Pedido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <RadioGroup
          value={selectedStatus || ""}
          onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
          disabled={hasProcessedQr}
        >
          <div className="grid grid-cols-2 gap-4">
            {allowedStatuses.map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={status}
                  id={status}
                  className="text-primary border-primary"
                />
                <Label htmlFor={status} className="cursor-pointer">
                  {statusLabels[status]}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

        <Button
          onClick={updateStatus}
          disabled={
            !selectedStatus || isUpdating || isSuccess || hasProcessedQr
          }
          className="w-full bg-primary hover:bg-primary/90"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Actualizando...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              ¡Estado Actualizado!
            </>
          ) : (
            "Actualizar Estado"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
