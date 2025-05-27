export type OrderStatus =
  | "RECIBIDO"
  | "EN_PREPARACION"
  | "PREPARADO"
  | "EN_EMBALAJE"
  | "EMBALADO"
  | "EN_DESPACHO"
  | "DESPACHADO"
  | "ENTREGADO";

export const statusLabels: Record<OrderStatus, string> = {
  RECIBIDO: "Recibido",
  EN_PREPARACION: "En Preparación",
  PREPARADO: "Preparado",
  EN_EMBALAJE: "En Embalaje",
  EMBALADO: "Embalado",
  EN_DESPACHO: "En Despacho",
  DESPACHADO: "Despachado",
  ENTREGADO: "Entregado",
};

export function getStatusLabel(status: string): string {
  return statusLabels[status as OrderStatus] || status;
}
