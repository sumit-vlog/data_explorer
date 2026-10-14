import { z } from 'zod';
import { ORDER_STATUSES, REGIONS } from '@/types/order';

export const SORT_FIELDS = ['createdAt', 'customer', 'status', 'total'] as const;
export const PAGE_SIZES = [50, 100, 500, 1000] as const;

const optionalNumber = z
  .preprocess(
    (value) => (value === '' || value == null ? undefined : Number(value)),
    z.number().nonnegative().optional(),
  )
  .catch(undefined);

export const orderQuerySchema = z.object({
  q: z.string().trim().max(100).catch(''),
  status: z.enum(ORDER_STATUSES).optional().catch(undefined),
  region: z.enum(REGIONS).optional().catch(undefined),
  minTotal: optionalNumber,
  maxTotal: optionalNumber,
  sort: z.enum(SORT_FIELDS).catch('createdAt'),
  order: z.enum(['asc', 'desc']).catch('desc'),
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce
    .number()
    .refine((size) => PAGE_SIZES.some((allowed) => allowed === size))
    .catch(PAGE_SIZES[0]),
});

export type OrderQuery = z.infer<typeof orderQuerySchema>;
export type OrderFilters = Pick<OrderQuery, 'q' | 'status' | 'region' | 'minTotal' | 'maxTotal'>;
export type SortField = OrderQuery['sort'];

export const DEFAULT_QUERY: OrderQuery = orderQuerySchema.parse({});

export function parseQuery(params: URLSearchParams): OrderQuery {
  return orderQuerySchema.parse(Object.fromEntries(params));
}

export function serializeQuery(query: Partial<OrderQuery>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    const isDefault = value === DEFAULT_QUERY[key as keyof OrderQuery];
    if (value !== undefined && value !== '' && !isDefault) params.set(key, String(value));
  }
  return params;
}

export function pickFilters({ q, status, region, minTotal, maxTotal }: OrderQuery): OrderFilters {
  return { q, status, region, minTotal, maxTotal };
}
