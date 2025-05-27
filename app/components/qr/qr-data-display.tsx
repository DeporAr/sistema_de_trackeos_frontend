"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { Button } from "@/app/components/ui/button";
import {
  PackageOpen,
  Calendar,
  User,
  Hash,
  ExternalLink,
  FileText,
} from "lucide-react";

interface ParsedQrData {
  orderId?: string;
  orderDate?: string;
  customer?: string;
  products?: string;
  status?: string;
  notes?: string;
  isValid: boolean;
}

export default function QrDataDisplay({ qrData }: { qrData: string | object }) {
  const [parsedData, setParsedData] = useState<ParsedQrData>({
    isValid: false,
  });
  const [showRaw, setShowRaw] = useState(false);
  const [qrString, setQrString] = useState("");

  useEffect(() => {
    try {
      const raw = typeof qrData === "string" ? qrData : JSON.stringify(qrData);
      setQrString(raw);

      let parsed: ParsedQrData = { isValid: false };

      try {
        const jsonData = JSON.parse(raw);
        parsed = {
          orderId: jsonData.orderId?.toString() || jsonData.id?.toString(),
          orderDate:
            jsonData.orderDate?.toString() || jsonData.timestamp?.toString(),
          customer: jsonData.customer?.toString() || jsonData.name?.toString(),
          products: jsonData.products?.toString(),
          status: jsonData.status?.toString(),
          notes: jsonData.notes?.toString() || jsonData.description?.toString(),
          isValid: true,
        };
      } catch (e) {
        // Si no es JSON, verificar si es URL
        if (raw.startsWith("http")) {
          const url = new URL(raw);
          const params = new URLSearchParams(url.search);

          parsed = {
            orderId:
              params.get("order_id") ||
              url.pathname.split("/").pop() ||
              "Desconocido",
            orderDate: params.get("date") || "Fecha no disponible",
            customer: params.get("customer") || "Cliente no especificado",
            status: params.get("status") || "Estado no especificado",
            isValid: true,
          };
        } else {
          // Parseo simple para otros formatos
          const parts = raw.split("|");
          parts.forEach((part) => {
            const [key, value] = part.split(":");
            if (key && value) {
              if (key.includes("ORDER") || key.includes("ID"))
                parsed.orderId = value;
              if (key.includes("DATE")) parsed.orderDate = value;
              if (key.includes("CUSTOMER") || key.includes("CLIENT"))
                parsed.customer = value;
              if (key.includes("STATUS")) parsed.status = value;
            }
          });

          parsed.isValid = !!parsed.orderId;
        }
      }

      setParsedData(parsed);
    } catch (error) {
      console.error("Error parsing QR data:", error);
      setParsedData({ isValid: false });
    }
  }, [qrData]);

  return (
    <Card className="border-primary/20">
      <CardHeader className="border-b border-primary/10">
        <div className="flex justify-between items-center">
          <CardTitle className="font-akira text-primary">
            Información del Pedido
          </CardTitle>
          <Badge
            variant={parsedData.isValid ? "default" : "destructive"}
            className={parsedData.isValid ? "bg-primary" : ""}
          >
            {parsedData.isValid ? "Válido" : "Formato Desconocido"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {parsedData.isValid ? (
          <>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-primary" />
              <span className="font-medium">ID del Pedido:</span>
              <span>{parsedData.orderId || "No disponible"}</span>
            </div>

            {parsedData.orderDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">Fecha:</span>
                <span>{parsedData.orderDate}</span>
              </div>
            )}

            {parsedData.customer && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium">Cliente:</span>
                <span>{parsedData.customer}</span>
              </div>
            )}

            {parsedData.status && (
              <div className="flex items-center gap-2">
                <PackageOpen className="h-4 w-4 text-primary" />
                <span className="font-medium">Estado:</span>
                <span>{parsedData.status}</span>
              </div>
            )}

            {parsedData.products && (
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-primary mt-1" />
                <div>
                  <span className="font-medium">Productos:</span>
                  <p className="text-sm">{parsedData.products}</p>
                </div>
              </div>
            )}

            {parsedData.notes && (
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-primary mt-1" />
                <div>
                  <span className="font-medium">Notas:</span>
                  <p className="text-sm">{parsedData.notes}</p>
                </div>
              </div>
            )}

            <Separator className="bg-primary/10" />

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRaw(!showRaw)}
                className="border-primary/20 hover:bg-primary/10"
              >
                {showRaw ? "Ocultar datos crudos" : "Mostrar datos crudos"}
              </Button>

              {showRaw && (
                <div className="mt-2 p-2 bg-muted rounded-md">
                  <pre className="text-xs overflow-auto whitespace-pre-wrap break-all">
                    {qrString}
                  </pre>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              No se pudo interpretar el formato del código QR. A continuación se
              muestran los datos sin procesar:
            </p>
            <div className="p-2 bg-muted rounded-md">
              <pre className="text-xs overflow-auto whitespace-pre-wrap break-all">
                {qrString}
              </pre>
            </div>
          </div>
        )}

        {qrString.startsWith("http") && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-primary/20 hover:bg-primary/10"
              onClick={() => window.open(qrString, "_blank")}
            >
              <ExternalLink className="h-4 w-4" />
              Abrir enlace
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
