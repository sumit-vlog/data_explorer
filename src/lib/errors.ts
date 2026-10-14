const FALLBACK_MESSAGE = 'Something went wrong. Check your connection and try again.';

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'data' in error) {
    const { message } = (error.data ?? {}) as { message?: unknown };
    if (typeof message === 'string') return message;
  }
  return FALLBACK_MESSAGE;
}

export function isNotFound(error: unknown): boolean {
  return !!error && typeof error === 'object' && 'status' in error && error.status === 404;
}
