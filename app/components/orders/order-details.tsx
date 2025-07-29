"use client";

import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
}

interface Order {
  id: string;
  status: string;
  items: OrderItem[];
  customer: {
    name: string;
    address: string;
  };
  createdAt: string;
}

interface OrderDetailsProps {
  order: Order;
  userRole: string;
  onUpdateStatus: (orderId: string, newStatus: string) => void;
  onReset: () => void;
  isProcessing: boolean;
}

export function OrderDetails({
  order,
  userRole,
  onUpdateStatus,
  onReset,
  isProcessing,
}: OrderDetailsProps) {
  const [selectedStatus, setSelectedStatus] = useState(order.status);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pendiente":
        return "Pendiente";
      case "en_preparacion":
        return "En Preparación";
      case "preparado":
        return "Preparado";
      case "en_embalaje":
        return "En Embalaje";
      case "embalado":
        return "Embalado";
      case "en_despacho":
        return "En Despacho";
      case "despachado":
        return "Despachado";
      case "entregado":
        return "Entregado";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800";
      case "en_preparacion":
        return "bg-blue-100 text-blue-800";
      case "preparado":
        return "bg-green-100 text-green-800";
      case "en_embalaje":
        return "bg-purple-100 text-purple-800";
      case "embalado":
        return "bg-indigo-100 text-indigo-800";
      case "en_despacho":
        return "bg-orange-100 text-orange-800";
      case "despachado":
        return "bg-teal-100 text-teal-800";
      case "entregado":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAvailableStatuses = () => {
    const allStatuses = [
      { value: "pendiente", label: "Pendiente" },
      { value: "en_preparacion", label: "En Preparación" },
      { value: "preparado", label: "Preparado" },
      { value: "en_embalaje", label: "En Embalaje" },
      { value: "embalado", label: "Embalado" },
      { value: "en_despacho", label: "En Despacho" },
      { value: "despachado", label: "Despachado" },
      { value: "entregado", label: "Entregado" },
    ];

    switch (userRole.toLowerCase()) {
      case "admin":
      case "operador":
        return allStatuses;
      default:
        return [];
    }
  };

  const handleUpdateStatus = () => {
    if (selectedStatus !== order.status) {
      onUpdateStatus(order.id, selectedStatus);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Detalles del Pedido</h2>
        <Button
          onClick={onReset}
          variant="ghost"
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Volver
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            ID del Pedido
          </h3>
          <p className="text-lg font-medium">{order.id}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Fecha de Creación
          </h3>
          <p>{formatDate(order.createdAt)}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Cliente</h3>
          <p>{order.customer.name}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Dirección</h3>
          <p>{order.customer.address}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Estado Actual
          </h3>
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              order.status,
            )}`}
          >
            {getStatusLabel(order.status)}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Productos</h3>
        <div className="bg-gray-50 rounded-md p-4">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm">
                <th className="pb-2">Producto</th>
                <th className="pb-2 text-right">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={item.id || index} className="border-t border-gray-200">
                  <td className="py-2">{item.name}</td>
                  <td className="py-2 text-right">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {getAvailableStatuses().length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium mb-3">Actualizar Estado</h3>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                disabled={isProcessing}
              >
                {getAvailableStatuses().map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleUpdateStatus}
              disabled={selectedStatus === order.status || isProcessing}
              className="flex items-center justify-center bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Actualizando...</span>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Actualizar Estado
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
