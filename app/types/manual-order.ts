// Tipos para la paginación de órdenes manuales
export interface ShippingData {
  address: string;
  recipientName: string;
  floor: string | null;
  door: string | null;
  postalCode: string;
  city: string;
  phone: string;
  housingType: string;
  observations: string | null;
  email: string;
}

export interface ManualOrder {
  id: number;
  orderCode: string;
  status: string;
  createdAt: string;
  shippingData: ShippingData;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  offset: number;
  paged: boolean;
  unpaged: boolean;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
}

export interface ManualOrderPage {
  content: ManualOrder[];
  pageable: Pageable;
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    unsorted: boolean;
    sorted: boolean;
    empty: boolean;
  };
  empty: boolean;
}
