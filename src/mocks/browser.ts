import { setupWorker } from 'msw/browser';
import { DEFAULT_CHAOS, handlers, setChaos } from './handlers';

const CHAOS_MODES = {
  off: { minDelayMs: 0, maxDelayMs: 0, failureRate: 0 },
  fail: { ...DEFAULT_CHAOS, failureRate: 1 },
} as const;

function applyChaosFromUrl() {
  const mode = new URLSearchParams(window.location.search).get('chaos');
  if (mode === 'off' || mode === 'fail') setChaos(CHAOS_MODES[mode]);
}

export async function startMockApi() {
  applyChaosFromUrl();
  await setupWorker(...handlers).start({ onUnhandledRequest: 'bypass', quiet: true });
}
