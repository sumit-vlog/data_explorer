import { delay, http, HttpResponse } from 'msw';
import { parseQuery, pickFilters } from '@/lib/searchParams';
import { generateOrders } from './data';
import { queryOrders, summarizeOrders } from './queryOrders';

export const ORDERS = generateOrders(10_000);
const ordersById = new Map(ORDERS.map((order) => [order.id, order]));

export interface ChaosConfig {
  minDelayMs: number;
  maxDelayMs: number;
  failureRate: number;
}

export const DEFAULT_CHAOS: ChaosConfig = { minDelayMs: 200, maxDelayMs: 3000, failureRate: 0.1 };

let chaos = DEFAULT_CHAOS;

export function setChaos(config: ChaosConfig) {
  chaos = config;
}

async function simulateNetwork(): Promise<Response | undefined> {
  await delay(chaos.minDelayMs + Math.random() * (chaos.maxDelayMs - chaos.minDelayMs));
  if (Math.random() < chaos.failureRate) {
    return HttpResponse.json(
      { message: 'The server failed to respond. Please try again.' },
      { status: 500 },
    );
  }
}

const searchParamsOf = (request: Request) => new URL(request.url).searchParams;

export const handlers = [
  http.get('*/api/orders', async ({ request }) => {
    const failure = await simulateNetwork();
    return failure ?? HttpResponse.json(queryOrders(ORDERS, parseQuery(searchParamsOf(request))));
  }),

  http.get('*/api/orders/summary', async ({ request }) => {
    const failure = await simulateNetwork();
    return (
      failure ??
      HttpResponse.json(summarizeOrders(ORDERS, pickFilters(parseQuery(searchParamsOf(request)))))
    );
  }),

  http.get('*/api/orders/:id', async ({ params }) => {
    const failure = await simulateNetwork();
    if (failure) return failure;

    const order = ordersById.get(String(params.id));
    return order
      ? HttpResponse.json(order)
      : HttpResponse.json({ message: 'Order not found' }, { status: 404 });
  }),
];
