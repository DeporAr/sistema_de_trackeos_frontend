export type OrderStatus =
  | "RECIBIDO"
  | "EN_PREPARACION"
  | "EMBALADO"
  | "DESPACHADO"
  | "ENTREGADO"
  | "EN_FALTANTE"
  | "CANCELADO";

export interface OrderStatusHistory {
  id: number;
  status: OrderStatus;
  startedAt: string;
  endedAt: string | null;
  changedBy: {
    id: number;
    name: string;
  };
}

export interface Order {
  id: number;
  orderCode: string;
  shippingCode: string | null;
  orderOrigin: string;
  status: OrderStatus;
  assignedTo: number;
  assignedToName: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: OrderStatusHistory[];
  imageUrl?: string | null;
}

export const statusLabels: Record<OrderStatus, string> = {
  RECIBIDO: "Recibido",
  EN_PREPARACION: "En Preparación",
  EMBALADO: "Embalado",
  DESPACHADO: "Despachado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
  EN_FALTANTE: "En Faltante",
};

export function getStatusLabel(status: string): string {
  return statusLabels[status as OrderStatus] || status;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "RECIBIDO":
      return "bg-yellow-100 text-yellow-800";
    case "EN_PREPARACION":
      return "bg-blue-100 text-blue-800";
    case "EMBALADO":
      return "bg-indigo-100 text-indigo-800";
    case "DESPACHADO":
      return "bg-teal-100 text-teal-800";
    case "ENTREGADO":
      return "bg-emerald-100 text-emerald-800";
    case "EN_FALTANTE":
      return "bg-red-100 text-red-800";
    case "CANCELADO":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
