/**
 * Shared fetch helpers for the archive API.
 *
 * Render free instances sleep after idle time. The first request then either
 * hangs while the process boots or fails with a network / 502 / 503 error.
 * Callers retry only those transient failures; 4xx and ordinary 500s stay
 * immediate errors.
 */

export const FIRST_WAKE_TIMEOUT_MS = 50_000;
export const RETRY_TIMEOUT_MS = 15_000;
export const DEFAULT_TIMEOUT_MS = 20_000;

/** Gaps before each attempt. Index 0 is the first try (no wait). */
export const WAKE_RETRY_DELAYS_MS = [0, 2500, 4000, 6000, 8000, 8000];

export class ApiError extends Error {
  readonly status?: number;
  readonly transient: boolean;

  constructor(
    message: string,
    options: { status?: number; transient?: boolean } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.transient = options.transient ?? false;
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function isTransientApiError(error: unknown): boolean {
  if (isAbortError(error)) return true;
  if (error instanceof ApiError) return error.transient;
  if (error instanceof TypeError) return true;
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("load failed") ||
    message.includes("timed out")
  );
}

export function classifyHttpError(status: number, message: string): ApiError {
  const transient =
    status === 502 ||
    status === 503 ||
    status === 504 ||
    status === 522 ||
    status === 523;
  return new ApiError(message, { status, transient });
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      return;
    }

    const timer = window.setTimeout(resolve, ms);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(signal?.reason ?? new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export async function fetchApi(
  input: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal: outer, ...rest } = init;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  const onOuterAbort = () => controller.abort();
  outer?.addEventListener("abort", onOuterAbort);

  try {
    return await fetch(input, { ...rest, signal: controller.signal });
  } catch (error) {
    if (outer?.aborted) {
      throw outer.reason ?? new DOMException("Aborted", "AbortError");
    }
    if (isAbortError(error)) {
      throw new ApiError("Request timed out.", { transient: true });
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Failed to fetch",
      { transient: true },
    );
  } finally {
    window.clearTimeout(timer);
    outer?.removeEventListener("abort", onOuterAbort);
  }
}

export async function withTransientRetry<T>(
  task: (attempt: number) => Promise<T>,
  options: {
    delaysMs?: number[];
    signal?: AbortSignal;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {},
): Promise<T> {
  const delays = options.delaysMs ?? WAKE_RETRY_DELAYS_MS;
  let lastError: unknown;

  for (let index = 0; index < delays.length; index += 1) {
    if (options.signal?.aborted) {
      throw options.signal.reason ?? new DOMException("Aborted", "AbortError");
    }

    if (delays[index] > 0) {
      await sleep(delays[index], options.signal);
    }

    try {
      return await task(index);
    } catch (error) {
      lastError = error;
      const canRetry =
        isTransientApiError(error) && index < delays.length - 1;
      if (!canRetry) throw error;
      options.onRetry?.(index + 1, error);
    }
  }

  throw lastError;
}
