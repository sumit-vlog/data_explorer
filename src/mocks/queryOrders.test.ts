import { DEFAULT_QUERY, pickFilters } from '@/lib/searchParams';
import { generateOrders } from './data';
import { queryOrders, summarizeOrders } from './queryOrders';

const orders = generateOrders(2_000);

describe('queryOrders', () => {
  it('filters, sorts and paginates on the server side', () => {
    const query = {
      ...DEFAULT_QUERY,
      status: 'shipped',
      sort: 'total',
      order: 'asc',
      page: 2,
      pageSize: 50,
    } as const;
    const { items, total } = queryOrders(orders, query);
    const allShipped = orders
      .filter((order) => order.status === 'shipped')
      .sort((a, b) => a.total - b.total);

    expect(total).toBe(allShipped.length);
    expect(items).toHaveLength(50);
    expect(items.every((order) => order.status === 'shipped')).toBe(true);
    expect(items.map((order) => order.total)).toEqual(
      allShipped.slice(50, 100).map((order) => order.total),
    );
  });

  it('summarizes the same filtered set the list is built from', () => {
    const query = { ...DEFAULT_QUERY, region: 'Europe' } as const;
    const summary = summarizeOrders(orders, pickFilters(query));
    const statusTotal = Object.values(summary.countByStatus).reduce((sum, count) => sum + count, 0);

    expect(statusTotal).toBe(queryOrders(orders, query).total);
  });
});
