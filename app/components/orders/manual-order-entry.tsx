"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Loader2, Plus, X } from "lucide-react";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { format } from "date-fns";

interface ShippingInfo {
  address: string;
  name: string;
  recipientName?: string;
  floor: string;
  door: string;
  postalCode: string;
  city: string;
  phone: string;
  housingType: string;
  observations: string;
  email: string;
}

interface ManualOrder {
  id: number;
  orderCode: string;
  status: string;
  createdAt: string;
  shippingData: ShippingInfo;
}

interface ManualOrderEntryProps {
  onSubmit: (shippingInfo: ShippingInfo) => void;
  isProcessing: boolean;
  onCancel?: () => void;
  searchQuery?: string;
  showForm?: boolean;
}

const API_BASE_URL = "https://incredible-charm-production.up.railway.app";

// --- FORMULARIO ---
export function ManualOrderForm({
  onSubmit,
  isProcessing,
  onCancel,
  onSuccess,
}: {
  onSubmit: (shippingInfo: ShippingInfo) => void;
  isProcessing: boolean;
  onCancel?: () => void;
  onSuccess?: (orderCode: string) => void;
}) {
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    address: "",
    name: "",
    floor: "",
    door: "",
    postalCode: "",
    city: "",
    phone: "",
    housingType: "",
    observations: "",
    email: "",
  });
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isProcessing) {
      const token = localStorage.getItem("authToken");
      const { name, ...rest } = shippingInfo;
      const res = await fetch(`${API_BASE_URL}/api/orders/manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingData: {
            ...rest,
            recipientName: name,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof onSuccess === "function") onSuccess(data.orderCode);
        if (typeof onCancel === "function") onCancel();
      }
      setShippingInfo({
        address: "",
        name: "",
        floor: "",
        door: "",
        postalCode: "",
        city: "",
        phone: "",
        housingType: "",
        observations: "",
        email: "",
      });
    }
  };

  const handleShippingInfoChange = (
    field: keyof ShippingInfo,
    value: string,
  ) => {
    setShippingInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Nuevo Pedido Manual</h3>
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {successMsg && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-2 text-center">
          {successMsg}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              placeholder="Nombre y apellidos"
              value={shippingInfo.name}
              onChange={(e) => handleShippingInfoChange("name", e.target.value)}
              disabled={isProcessing}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={shippingInfo.email}
              onChange={(e) =>
                handleShippingInfoChange("email", e.target.value)
              }
              disabled={isProcessing}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              placeholder="Calle y número"
              value={shippingInfo.address}
              onChange={(e) =>
                handleShippingInfoChange("address", e.target.value)
              }
              disabled={isProcessing}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Código Postal</Label>
            <Input
              id="postalCode"
              placeholder="Código postal"
              value={shippingInfo.postalCode}
              onChange={(e) =>
                handleShippingInfoChange("postalCode", e.target.value)
              }
              disabled={isProcessing}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Localidad</Label>
            <Input
              id="city"
              placeholder="Ciudad"
              value={shippingInfo.city}
              onChange={(e) => handleShippingInfoChange("city", e.target.value)}
              disabled={isProcessing}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Número de teléfono"
              value={shippingInfo.phone}
              onChange={(e) =>
                handleShippingInfoChange("phone", e.target.value)
              }
              disabled={isProcessing}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="floor">Piso</Label>
            <Input
              id="floor"
              placeholder="Número de piso"
              value={shippingInfo.floor}
              onChange={(e) =>
                handleShippingInfoChange("floor", e.target.value)
              }
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="door">Puerta</Label>
            <Input
              id="door"
              placeholder="Número de puerta"
              value={shippingInfo.door}
              onChange={(e) => handleShippingInfoChange("door", e.target.value)}
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="housingType">Tipo de vivienda</Label>
            <Select
              value={shippingInfo.housingType}
              onValueChange={(value) =>
                handleShippingInfoChange("housingType", value)
              }
              disabled={isProcessing}
            >
              <SelectTrigger className="border border-input bg-background focus-visible:ring-primary">
                <SelectValue placeholder="Selecciona el tipo de vivienda" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-input">
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="piso">Piso</SelectItem>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="oficina">Oficina</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="observations">Observaciones</Label>
            <Textarea
              id="observations"
              placeholder="Observaciones adicionales para la entrega"
              value={shippingInfo.observations}
              onChange={(e) =>
                handleShippingInfoChange("observations", e.target.value)
              }
              disabled={isProcessing}
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Crear Pedido
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

// --- LISTADO Y BUSCADOR ---
export function ManualOrderList({ searchQuery }: { searchQuery: string }) {
  const [manualOrders, setManualOrders] = useState<ManualOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchManualOrders();
  }, []);

  const fetchManualOrders = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/orders/manual`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setManualOrders(data);
      }
    } catch (error) {
      console.error("Error fetching manual orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RECIBIDO":
        return "bg-blue-100 text-blue-800";
      case "EN_PREPARACION":
        return "bg-yellow-100 text-yellow-800";
      case "PREPARADO":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = manualOrders.filter((order) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      order.id?.toString().includes(searchLower) ||
      (order.orderCode || "").toLowerCase().includes(searchLower) ||
      (order.shippingData?.recipientName || order.shippingData?.name || "")
        .toLowerCase()
        .includes(searchLower) ||
      (order.shippingData?.address || "").toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pedidos Manuales Recientes</h3>
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.orderCode}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.shippingData.recipientName}</TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    {searchQuery
                      ? "No se encontraron pedidos que coincidan con la búsqueda"
                      : "No hay pedidos manuales registrados"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
