"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import { Download, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/app/context/auth-context";
import type { UserRole } from "@/app/context/auth-context";

interface OrderData {
  orderId: string;
  orderDate: string;
  customer: string;
  products: string;
  status: string;
  notes: string;
}

interface QrGeneratorProps {
  onQrGenerated: (data: string) => void;
  userId: string;
  userName: string;
  userRole: UserRole;
}

export default function QrGenerator({
  onQrGenerated,
  userId,
  userName,
  userRole,
}: QrGeneratorProps) {
  const [orderData, setOrderData] = useState<OrderData>({
    orderId: "",
    orderDate: new Date().toISOString().split("T")[0],
    customer: "",
    products: "",
    status: "recibido",
    notes: "",
  });

  const [qrValue, setQrValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof OrderData, value: string) => {
    setOrderData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const createOrder = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validar datos mínimos
      if (!orderData.orderId || !orderData.customer || !orderData.products) {
        throw new Error(
          "Por favor completa los campos obligatorios: ID del Pedido, Cliente y Productos",
        );
      }

      // Simulación para entorno de desarrollo
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generar QR con los datos del formulario para demo
      const qrData = JSON.stringify({
        ...orderData,
        orderId:
          orderData.orderId || `DEMO-${Math.floor(Math.random() * 10000)}`,
      });

      setQrValue(qrData);
    } catch (error) {
      console.error("Error de validación:", error);
      setError(
        error instanceof Error ? error.message : "Error al crear el pedido",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrValue) return;

    // Crear un elemento canvas temporal
    const canvas = document.createElement("canvas");
    const size = 200;
    canvas.width = size;
    canvas.height = size;

    // Dibujar el QR en el canvas
    const qrCodeElement = document.getElementById("qr-code") as SVGSVGElement;
    if (!qrCodeElement) return;

    const svgData = new XMLSerializer().serializeToString(qrCodeElement);
    const img = new Image();
    img.crossOrigin = "anonymous"; // Añadir esto para evitar problemas CORS

    img.onload = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Dibujar fondo blanco
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, size, size);

      // Dibujar el QR
      ctx.drawImage(img, 0, 0, size, size);

      // Descargar la imagen
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `pedido-${orderData.orderId || "nuevo"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  const registerOrder = () => {
    if (!qrValue) return;
    onQrGenerated(qrValue);
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="border-b border-primary/10">
          <CardTitle className="font-akira text-primary">
            Crear Pedido Manualmente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderId">ID del Pedido *</Label>
              <Input
                id="orderId"
                placeholder="ML-123456"
                value={orderData.orderId}
                onChange={(e) => handleChange("orderId", e.target.value)}
                className="border-primary/20 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderDate">Fecha</Label>
              <Input
                id="orderDate"
                type="date"
                value={orderData.orderDate}
                onChange={(e) => handleChange("orderDate", e.target.value)}
                className="border-primary/20 focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer">Cliente *</Label>
            <Input
              id="customer"
              placeholder="Nombre del cliente"
              value={orderData.customer}
              onChange={(e) => handleChange("customer", e.target.value)}
              className="border-primary/20 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="products">Productos *</Label>
            <Textarea
              id="products"
              placeholder="Lista de productos"
              value={orderData.products}
              onChange={(e) => handleChange("products", e.target.value)}
              className="border-primary/20 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado Inicial</Label>
            <Select
              value={orderData.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger className="border-primary/20 focus:ring-primary">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recibido">Recibido</SelectItem>
                <SelectItem value="en_preparacion">En Preparación</SelectItem>
                <SelectItem value="embalado">Embalado</SelectItem>
                <SelectItem value="envio">Envío</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionales"
              value={orderData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="border-primary/20 focus-visible:ring-primary"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button
            onClick={createOrder}
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando Pedido...
              </>
            ) : (
              "Crear Pedido y Generar QR"
            )}
          </Button>
        </CardFooter>
      </Card>

      {qrValue && (
        <Card className="border-primary/20">
          <CardHeader className="border-b border-primary/10">
            <CardTitle className="font-akira text-primary">
              Código QR Generado
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-4">
            <div className="bg-white p-4 rounded-lg border border-primary/20">
              <QRCodeSVG
                id="qr-code"
                value={qrValue}
                size={200}
                level="H"
                includeMargin
                bgColor="#FFFFFF"
                fgColor="#000000"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={downloadQR}
              className="border-primary/20 hover:bg-primary/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
            <Button
              onClick={registerOrder}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4 mr-2" />
              Registrar Pedido
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
