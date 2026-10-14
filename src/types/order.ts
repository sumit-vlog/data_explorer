export const ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
] as const;

export const REGIONS = [
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Middle East & Africa',
] as const;

export const CATEGORIES = ['Electronics', 'Home', 'Apparel', 'Sports', 'Books', 'Toys'] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type Region = (typeof REGIONS)[number];
export type Category = (typeof CATEGORIES)[number];

export interface Order {
  id: string;
  customer: string;
  email: string;
  product: string;
  category: Category;
  status: OrderStatus;
  region: Region;
  quantity: number;
  total: number;
  createdAt: string;
}

export interface OrdersPage {
  items: Order[];
  total: number;
}

export interface OrdersSummary {
  totalRevenue: number;
  countByStatus: Record<OrderStatus, number>;
}
