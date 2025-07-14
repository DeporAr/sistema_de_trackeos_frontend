import type { Order } from "./order";

export interface OrderPage {
  content: Order[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      unsorted: boolean;
      sorted: boolean;
      empty: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
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

export interface MetricsOrderByStatus {
  status: string;
  count: number;
}

export interface MetricsOrderByUser {
  userId: string;
  userName: string;
  count: number;
}

export interface MetricsOrderByDate {
  date: string;
  count: number;
  previousCount: number | null;
}

export interface MetricsResponse {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  averageProcessingTime: number;
  ordersAtRisk: number;
  ordersByStatus: MetricsOrderByStatus[];
  ordersByUser: MetricsOrderByUser[];
  ordersByDate: MetricsOrderByDate[];
  orders: OrderPage;
}
