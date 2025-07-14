export type OrderStatus =
  | "RECIBIDO"
  | "EN_PREPARACION"
  | "PREPARADO"
  | "EN_EMBALAJE"
  | "EMBALADO"
  | "EN_DESPACHO"
  | "DESPACHADO"
  | "ENTREGADO"
  | "ENVIADO";

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
  PREPARADO: "Preparado",
  EN_EMBALAJE: "En Embalaje",
  EMBALADO: "Embalado",
  EN_DESPACHO: "En Despacho",
  DESPACHADO: "Despachado",
  ENTREGADO: "Entregado",
  ENVIADO: "Enviado",
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
    case "ENVIADO":
      return "bg-cyan-100 text-cyan-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
