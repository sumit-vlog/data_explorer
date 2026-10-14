import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { serializeQuery, type OrderFilters, type OrderQuery } from '@/lib/searchParams';
import type { Order, OrdersPage, OrdersSummary } from '@/types/order';

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${window.location.origin}/api` }),
  endpoints: (build) => ({
    getOrders: build.query<OrdersPage, OrderQuery>({
      query: (query) => `orders?${serializeQuery(query)}`,
    }),
    getSummary: build.query<OrdersSummary, OrderFilters>({
      query: (filters) => `orders/summary?${serializeQuery(filters)}`,
    }),
    getOrder: build.query<Order, string>({
      query: (id) => `orders/${encodeURIComponent(id)}`,
    }),
  }),
});

export const { useGetSummaryQuery, useGetOrderQuery, useLazyGetOrdersQuery } = ordersApi;
