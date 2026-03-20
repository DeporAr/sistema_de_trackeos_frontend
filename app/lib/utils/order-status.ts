export type OrderStatus =
  | "CREADO"
  | "IMPRESO"
  | "RECIBIDO"
  | "EN_PREPARACION"
  | "EMBALADO"
  | "DESPACHADO"
  | "CANCELADO"
  | "EN_FALTANTE";

export const statusLabels: Record<OrderStatus, string> = {
  CREADO: "Creado",
  IMPRESO: "Impreso",
  RECIBIDO: "Recibido",
  EN_PREPARACION: "En Preparación",
  EMBALADO: "Embalado",
  DESPACHADO: "Despachado",
  CANCELADO: "Cancelado",
  EN_FALTANTE: "En Faltante",
};

export function getStatusLabel(status: string): string {
  return statusLabels[status as OrderStatus] || status;
}
