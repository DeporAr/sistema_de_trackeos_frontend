"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { Order } from "@/app/types/order";
import { format, parseISO } from "date-fns";
import { getStatusLabel, getStatusColor } from "@/app/types/order";
import { StatusHistoryTable } from "./status-history-table";

// Datos mockeados
const mockOrders: Order[] = [
  {
    id: 1,
    status: "RECIBIDO",
    assignedTo: "user1",
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
  },
  {
    id: 2,
    status: "ENTREGADO",
    assignedTo: "user2",
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
  },
  {
    id: 3,
    status: "EN_PREPARACION",
    assignedTo: "user3",
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
  },
];

interface MetricsTableProps {
  orders: Order[];
}

export function MetricsTable({ orders }: MetricsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const itemsPerPage = 10;

  const filteredOrders = orders.filter(
    (order) =>
      String(order.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()),
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
            placeholder="Buscar por ID o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Envío</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              <TableHead>Última actualización</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order) => (
              <>
                <TableRow
                  key={order.id}
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
                    {order.shippingCode ? (
                      <span>{order.shippingCode}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.assignedToName || "No asignado"}</TableCell>
                  <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                  <TableCell>{formatDateTime(order.updatedAt)}</TableCell>
                </TableRow>
                {expandedOrderId === order.id && order.statusHistory && (
                  <TableRow>
                    <TableCell colSpan={8} className="p-0 bg-transparent">
                      <StatusHistoryTable history={order.statusHistory} />
                    </TableCell>
                  </TableRow>
                )}
              </>
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
    </div>
  );
}
