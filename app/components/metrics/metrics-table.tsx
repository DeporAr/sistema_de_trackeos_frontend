"use client";

import React, { useState, useEffect } from "react";
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
import { Order } from "@/app/types/order";
import { format, parseISO } from "date-fns";
import { getStatusLabel, getStatusColor } from "@/app/types/order";
import { StatusHistoryTable } from "./status-history-table";
import { AuthenticatedImage } from "./authenticated-image";

// Datos mockeados
const mockOrders: Order[] = [
  {
    id: 1,
    orderCode: "ORD-001",
    shippingCode: "SHIP-001",
    orderOrigin: "Tienda Online",
    status: "RECIBIDO",
    assignedTo: 1,
    assignedToName: "Juan Pérez",
    createdAt: "2024-03-20T10:00:00Z",
    updatedAt: "2024-03-20T10:00:00Z",
    statusHistory: [
      {
        id: 1,
        status: "RECIBIDO",
        startedAt: "2024-03-20T10:00:00Z",
        endedAt: "2024-03-20T10:30:00Z",
        changedBy: { id: 1, name: "Sistema" },
      },
      {
        id: 2,
        status: "EN_PREPARACION",
        startedAt: "2024-03-20T10:30:00Z",
        endedAt: "2024-03-20T11:45:00Z",
        changedBy: { id: 2, name: "María García" },
      },
      {
        id: 3,
        status: "PREPARADO",
        startedAt: "2024-03-20T11:45:00Z",
        endedAt: "2024-03-20T12:00:00Z",
        changedBy: { id: 2, name: "María García" },
      },
      {
        id: 4,
        status: "EN_EMBALAJE",
        startedAt: "2024-03-20T12:00:00Z",
        endedAt: null,
        changedBy: { id: 3, name: "Carlos López" },
      },
    ],
    packageImageUrl: "https://example.com/package-image-1.jpg",
  },
  {
    id: 2,
    orderCode: "ORD-002",
    shippingCode: "SHIP-002",
    orderOrigin: "Mercado Libre",
    status: "ENTREGADO",
    assignedTo: 2,
    assignedToName: "Ana Martínez",
    createdAt: "2024-03-19T09:00:00Z",
    updatedAt: "2024-03-19T15:30:00Z",
    statusHistory: [
      {
        id: 5,
        status: "RECIBIDO",
        startedAt: "2024-03-19T09:00:00Z",
        endedAt: "2024-03-19T09:30:00Z",
        changedBy: { id: 1, name: "Sistema" },
      },
      {
        id: 6,
        status: "EN_PREPARACION",
        startedAt: "2024-03-19T09:30:00Z",
        endedAt: "2024-03-19T11:00:00Z",
        changedBy: { id: 2, name: "María García" },
      },
      {
        id: 7,
        status: "PREPARADO",
        startedAt: "2024-03-19T11:00:00Z",
        endedAt: "2024-03-19T11:30:00Z",
        changedBy: { id: 2, name: "María García" },
      },
      {
        id: 8,
        status: "EN_EMBALAJE",
        startedAt: "2024-03-19T11:30:00Z",
        endedAt: "2024-03-19T12:00:00Z",
        changedBy: { id: 3, name: "Carlos López" },
      },
      {
        id: 9,
        status: "EMBALADO",
        startedAt: "2024-03-19T12:00:00Z",
        endedAt: "2024-03-19T13:00:00Z",
        changedBy: { id: 3, name: "Carlos López" },
      },
      {
        id: 10,
        status: "EN_DESPACHO",
        startedAt: "2024-03-19T13:00:00Z",
        endedAt: "2024-03-19T14:00:00Z",
        changedBy: { id: 4, name: "Roberto Sánchez" },
      },
      {
        id: 11,
        status: "DESPACHADO",
        startedAt: "2024-03-19T14:00:00Z",
        endedAt: "2024-03-19T15:00:00Z",
        changedBy: { id: 4, name: "Roberto Sánchez" },
      },
      {
        id: 12,
        status: "ENTREGADO",
        startedAt: "2024-03-19T15:00:00Z",
        endedAt: "2024-03-19T15:30:00Z",
        changedBy: { id: 4, name: "Roberto Sánchez" },
      },
    ],
    packageImageUrl: "https://example.com/package-image-2.jpg",
  },
  {
    id: 3,
    orderCode: "ORD-003",
    shippingCode: "SHIP-003",
    orderOrigin: "Tienda Física",
    status: "EN_PREPARACION",
    assignedTo: 3,
    assignedToName: "Pedro Rodríguez",
    createdAt: "2024-03-20T08:00:00Z",
    updatedAt: "2024-03-20T08:00:00Z",
    statusHistory: [
      {
        id: 13,
        status: "RECIBIDO",
        startedAt: "2024-03-20T08:00:00Z",
        endedAt: "2024-03-20T08:15:00Z",
        changedBy: { id: 1, name: "Sistema" },
      },
      {
        id: 14,
        status: "EN_PREPARACION",
        startedAt: "2024-03-20T08:15:00Z",
        endedAt: null,
        changedBy: { id: 2, name: "María García" },
      },
    ],
    packageImageUrl: "https://example.com/package-image-3.jpg",
  },
];

interface MetricsTableProps {
  orders: Order[];
}

export function MetricsTable({ orders }: MetricsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setAuthToken(token);
  }, []);

  const filteredOrders = orders.filter(
    (order) =>
      String(order.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.assignedToName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (order.shippingCode || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (order.orderOrigin || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID, código, responsable o envío..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {selectedImageUrl && (
        <Dialog
          open={!!selectedImageUrl}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setSelectedImageUrl(null);
            }
          }}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Imagen del Paquete</DialogTitle>
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
            {paginatedOrders.map((order) => (
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
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageUrl(order.imageUrl || null);
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
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
      {/* Modal para ver imagen */}
      {selectedImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={() => setSelectedImageUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white p-4 rounded-lg">
              <AuthenticatedImage
                imageUrl={selectedImageUrl}
                token={authToken}
              />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageUrl(null);
              }}
              className="absolute -top-2 -right-2 p-1 bg-white rounded-full text-gray-800 hover:bg-gray-200 shadow-lg"
            >
              <ChevronDown className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
