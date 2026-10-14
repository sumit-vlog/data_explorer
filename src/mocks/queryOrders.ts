import type { OrderFilters, OrderQuery } from '@/lib/searchParams';
import { ORDER_STATUSES, type Order, type OrdersPage, type OrdersSummary } from '@/types/order';

export function filterOrders(orders: Order[], filters: OrderFilters): Order[] {
  const term = filters.q.toLowerCase();

  return orders.filter(
    (order) =>
      (!term ||
        order.id.toLowerCase().includes(term) ||
        order.customer.toLowerCase().includes(term) ||
        order.email.includes(term) ||
        order.product.toLowerCase().includes(term)) &&
      (!filters.status || order.status === filters.status) &&
      (!filters.region || order.region === filters.region) &&
      (filters.minTotal === undefined || order.total >= filters.minTotal) &&
      (filters.maxTotal === undefined || order.total <= filters.maxTotal),
  );
}

export function queryOrders(orders: Order[], query: OrderQuery): OrdersPage {
  const direction = query.order === 'asc' ? 1 : -1;
  const sorted = filterOrders(orders, query).sort((a, b) => {
    const left = a[query.sort];
    const right = b[query.sort];
    const result =
      typeof left === 'number'
        ? left - (right as number)
        : String(left).localeCompare(String(right));
    return (result || a.id.localeCompare(b.id)) * direction;
  });
  const start = (query.page - 1) * query.pageSize;

  return { items: sorted.slice(start, start + query.pageSize), total: sorted.length };
}

export function summarizeOrders(orders: Order[], filters: OrderFilters): OrdersSummary {
  const countByStatus = Object.fromEntries(
    ORDER_STATUSES.map((status) => [status, 0]),
  ) as OrdersSummary['countByStatus'];
  let totalRevenue = 0;

  for (const order of filterOrders(orders, filters)) {
    countByStatus[order.status] += 1;
    totalRevenue += order.total;
  }

  return { totalRevenue: Math.round(totalRevenue * 100) / 100, countByStatus };
}
