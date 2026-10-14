import { useCallback, useEffect, useRef } from 'react';
import { useLazyGetOrdersQuery } from '@/api/ordersApi';
import type { OrderQuery } from '@/lib/searchParams';

type OrdersRequest = ReturnType<ReturnType<typeof useLazyGetOrdersQuery>[0]>;

/**
 * Fetches a page of orders and aborts the previous request whenever the query changes.
 * Callers must render `currentData` only: it always belongs to the latest query.
 */
export function useOrders(query: OrderQuery) {
  const [fetchOrders, result] = useLazyGetOrdersQuery();
  const requestRef = useRef<OrdersRequest>();

  useEffect(() => {
    const previous = requestRef.current;
    if (previous && previous.arg !== query) previous.abort();
    requestRef.current = fetchOrders(query, true);
  }, [fetchOrders, query]);

  const retry = useCallback(() => {
    requestRef.current = fetchOrders(query);
  }, [fetchOrders, query]);

  return { ...result, retry };
}
