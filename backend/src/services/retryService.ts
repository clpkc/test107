export interface RetryContext {
  attempt: number;
  maxRetries: number;
}

export interface RetryOptions {
  maxRetries: number;
  shouldRetry: (error: unknown) => boolean;
  delayMs?: number;
  jitterMs?: number;
  onRetry?: (ctx: RetryContext) => void;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  const baseDelay = options.delayMs ?? 50;
  const jitterMs = options.jitterMs ?? 25;
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= options.maxRetries || !options.shouldRetry(error)) {
        throw error;
      }
      attempt += 1;
      options.onRetry?.({ attempt, maxRetries: options.maxRetries });
      const backoff = baseDelay * 2 ** (attempt - 1);
      const jitter = Math.floor(Math.random() * jitterMs);
      await sleep(backoff + jitter);
    }
  }
}
