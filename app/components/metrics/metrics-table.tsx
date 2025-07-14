"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Search, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { getStatusLabel, getStatusColor } from "@/app/types/order";
import { StatusHistoryTable } from "./status-history-table";
import { AuthenticatedImage } from "./authenticated-image";
import { Order } from "@/app/types/order";

interface MetricsTableProps {
  orders: Order[];
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export function MetricsTable({ orders, totalPages, currentPage, setCurrentPage }: MetricsTableProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const imageButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setAuthToken(token);
  }, []);

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      return dateString;
    }
  };

  // Generar un ID único para el diálogo
  const dialogDescriptionId = React.useId();

  return (
    <div className="space-y-4">
      {selectedImageUrl && (
        <Dialog
          open={!!selectedImageUrl}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setSelectedImageUrl(null);
            }
          }}
        >
          <DialogContent
            className="max-w-3xl"
            aria-describedby={dialogDescriptionId}
          >
            <DialogHeader>
              <DialogTitle>Imagen del Paquete</DialogTitle>
              <p id={dialogDescriptionId} className="sr-only">
                Vista previa de la imagen del paquete
              </p>
            </DialogHeader>
            <div className="flex justify-center items-center p-4">
              <AuthenticatedImage
                imageUrl={selectedImageUrl}
                token={authToken}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Envío</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              <TableHead>Última actualización</TableHead>
              <TableHead className="text-right">Imagen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order: import("@/app/types/order").Order) => (
              <React.Fragment key={order.id}>
                <TableRow
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    setExpandedOrderId(
                      expandedOrderId === order.id ? null : order.id,
                    )
                  }
                >
                  <TableCell>
                    {expandedOrderId === order.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </TableCell>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{order.orderCode}</div>
                  </TableCell>
                  <TableCell>
                    {order.orderOrigin || "N/A"}
                  </TableCell>
                  <TableCell>
                    {order.shippingCode || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.assignedToName || "No asignado"}</TableCell>
                  <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                  <TableCell>{formatDateTime(order.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    {order.imageUrl ? (
                      <Button
                        ref={order.id === 1 ? imageButtonRef : null}
                        variant="ghost"
                        size="icon"
                        aria-label={`Ver imagen de la orden ${order.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();

                          if (!order.imageUrl || !authToken) {
                            return;
                          }
                          setSelectedImageUrl(order.imageUrl);
                        }}
                      >
                        <ImageIcon className="h-5 w-5" />
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                </TableRow>
                {expandedOrderId === order.id && order.statusHistory && (
                  <TableRow>
                    <TableCell colSpan={10} className="p-0 bg-transparent">
                      <StatusHistoryTable history={order.statusHistory} />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            {"<<"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="text-sm">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            {">>"}
          </Button>
        </div>
      )}
    </div>
  );
}
