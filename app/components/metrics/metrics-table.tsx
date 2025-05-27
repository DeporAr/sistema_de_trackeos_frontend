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
import { Search } from "lucide-react";
import { Order } from "@/app/types/order";
import { format } from "date-fns";
import { getStatusLabel } from "@/app/types/order";

interface MetricsTableProps {
  orders: Order[];
}

export function MetricsTable({ orders }: MetricsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredOrders = orders.filter((order) =>
    String(order.id).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "RECIBIDO":
        return "default";
      case "EN_PREPARACION":
        return "secondary";
      case "PREPARADO":
        return "outline";
      case "EN_EMBALAJE":
        return "secondary";
      case "EMBALADO":
        return "outline";
      case "EN_DESPACHO":
        return "secondary";
      case "DESPACHADO":
        return "outline";
      case "ENTREGADO":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RECIBIDO":
        return "bg-yellow-100 text-yellow-800";
      case "EN_PREPARACION":
        return "bg-blue-100 text-blue-800";
      case "PREPARADO":
        return "bg-green-100 text-green-800";
      case "EN_EMBALAJE":
        return "bg-purple-100 text-purple-800";
      case "EMBALADO":
        return "bg-indigo-100 text-indigo-800";
      case "EN_DESPACHO":
        return "bg-orange-100 text-orange-800";
      case "DESPACHADO":
        return "bg-teal-100 text-teal-800";
      case "ENTREGADO":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateTimeInStatus = (order: Order) => {
    const now = new Date();
    const updatedAt = new Date(order.updatedAt);
    const diffInHours = Math.floor(
      (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60),
    );
    return `${diffInHours}h`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID..."
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
              <TableHead>ID</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              <TableHead>Última actualización</TableHead>
              <TableHead>Tiempo en estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {order.assignedToName || order.assignedTo || "No asignado"}
                </TableCell>
                <TableCell>
                  {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  {format(new Date(order.updatedAt), "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>{calculateTimeInStatus(order)}</TableCell>
              </TableRow>
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
