export type OrderStatus =
  | "RECIBIDO"
  | "EN_PREPARACION"
  | "EMBALADO"
  | "DESPACHADO"
  | "CANCELADO";

export const statusLabels: Record<OrderStatus, string> = {
  RECIBIDO: "Recibido",
  EN_PREPARACION: "En Preparación",
  EMBALADO: "Embalado",
  DESPACHADO: "Despachado",
  CANCELADO: "Cancelado",
};

export function getStatusLabel(status: string): string {
  return statusLabels[status as OrderStatus] || status;
}
