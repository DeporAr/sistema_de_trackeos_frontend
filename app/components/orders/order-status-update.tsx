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
  | "EMBALADO"
  | "DESPACHADO"
  | "CANCELADO";

// Define user role type
export type UserRole = "super_admin" | "admin" | "operador";

// Interfaz para el rol del usuario
interface Role {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Modificar el mapeo de roles a estados permitidos
const roleStatusMap: Record<UserRole, OrderStatus[]> = {
  super_admin: ["RECIBIDO", "EN_PREPARACION", "EMBALADO", "DESPACHADO", "CANCELADO"],
  admin: ["RECIBIDO", "EN_PREPARACION", "EMBALADO", "DESPACHADO", "CANCELADO"],
  operador: ["RECIBIDO", "EN_PREPARACION", "EMBALADO", "DESPACHADO", "CANCELADO"],
};

// Status labels for display
const statusLabels: Record<OrderStatus, string> = {
  RECIBIDO: "Recibido",
  EN_PREPARACION: "En Preparación",
  EMBALADO: "Embalado",
  DESPACHADO: "Despachado",
  CANCELADO: "Cancelado",
};

interface Order {
  id: string;
  status: string;
}
interface OrderStatusUpdateProps {
  qrData: string;
  onStatusChange: (updatedOrder: Order) => void;
  userRole: Role;
}

export default function OrderStatusUpdate({
  qrData,
  onStatusChange,
  userRole,
}: OrderStatusUpdateProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(
    null,
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Convertir el nombre del rol a minúsculas para el mapeo
  const normalizedRole = userRole?.name?.toLowerCase() as UserRole;
  // Get allowed statuses for this user role
  const allowedStatuses = roleStatusMap[normalizedRole] || [];

  const handleJwtError = () => {
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  const updateStatus = async () => {
    if (!selectedStatus) return;

    setIsUpdating(true);
    setIsSuccess(false);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const requestBody = {
        orderStatus: selectedStatus,
        userId: userRole.id, // Suponiendo que el ID del usuario está en userRole
        userName: userRole.name, // Suponiendo que el nombre está en userRole
      };

      const response = await fetch(
        `https://incredible-charm-production.up.railway.app/orders/${qrData}/status`,
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
        if (
          errorData.status === 403 &&
          errorData.detail?.includes("JWT expired")
        ) {
          handleJwtError();
          return;
        }
        throw new Error(errorData.error || "Error al actualizar el estado");
      }

      const updatedOrder = await response.json();
      onStatusChange(updatedOrder); // Notificar al padre sobre el cambio
      setIsSuccess(true);
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

  useEffect(() => {
    setSelectedStatus(null);
    setIsSuccess(false);
    setErrorMessage(null);
  }, [qrData]);

  if (!userRole || !allowedStatuses.length) {
    return (
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-700">
          Tu rol no tiene permisos para cambiar el estado de este pedido.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-lg font-medium text-gray-800">Actualizar Estado</h3>
      <div className="mt-4 space-y-4">
        <RadioGroup
          value={selectedStatus || ""}
          onValueChange={(value) => setSelectedStatus(value as OrderStatus)}
          disabled={isSuccess || isUpdating}
        >
          <div className="grid grid-cols-2 gap-4">
            {allowedStatuses.map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <RadioGroupItem value={status} id={status} />
                <Label htmlFor={status}>{statusLabels[status]}</Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        {errorMessage && (
          <p className="text-sm text-red-500">{errorMessage}</p>
        )}

        <Button
          onClick={updateStatus}
          disabled={!selectedStatus || isUpdating || isSuccess}
          className="w-full"
        >
          {isUpdating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isSuccess ? (
            <CheckCircle2 className="mr-2 h-4 w-4" />
          ) : null}
          {isUpdating
            ? "Actualizando..."
            : isSuccess
              ? "¡Estado Actualizado!"
              : "Confirmar Cambio de Estado"}
        </Button>
      </div>
    </div>
  );
}
