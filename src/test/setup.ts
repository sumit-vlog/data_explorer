import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { server } from '@/mocks/server';
import { DEFAULT_CHAOS, setChaos } from '@/mocks/handlers';

// Node's fetch rejects jsdom's AbortSignal; aborting is still handled by RTK Query itself.
globalThis.Request = class extends Request {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(input, { ...init, signal: undefined });
  }
};

// jsdom has no layout, so give the virtualized table a viewport to render rows into.
Object.defineProperties(HTMLElement.prototype, {
  offsetHeight: { configurable: true, get: () => 800 },
  offsetWidth: { configurable: true, get: () => 1200 },
});

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

beforeEach(() => setChaos({ ...DEFAULT_CHAOS, minDelayMs: 0, maxDelayMs: 0, failureRate: 0 }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => server.close());
