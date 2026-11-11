/** The smallest thing the data layer needs from the network: GET a URL, get text and a status. */
export interface HttpClient {
    get(
        url: string,
        signal?: AbortSignal,
    ): Promise<{ readonly status: number; readonly body: string }>;
}

/** Raised for a request that took longer than the contract allows. */
export class TimeoutError extends Error {
    override readonly name = 'TimeoutError';
}

/** Raised when the caller cancelled the request (the screen went away). */
export class CancelledError extends Error {
    override readonly name = 'CancelledError';
}

/** Raised for a non-2xx answer. */
export class HttpStatusError extends Error {
    override readonly name = 'HttpStatusError';
    constructor(readonly status: number) {
        super(`HTTP ${status}`);
    }
}

/**
 * The real client, on `fetch`, with the rules from API_CONTRACT §4: a 15-second timeout and a
 * User-Agent without personal data. A caller's `signal` cancels the request.
 */
export function createFetchHttpClient(
    userAgent: string,
    timeoutMs = 15_000,
): HttpClient {
    return {
        async get(url, signal) {
            const controller = new AbortController();
            let timedOut = false;
            const timer = setTimeout(() => {
                timedOut = true;
                controller.abort();
            }, timeoutMs);
            const onCallerAbort = () => controller.abort();
            signal?.addEventListener('abort', onCallerAbort);
            try {
                const response = await fetch(url, {
                    headers: { 'User-Agent': userAgent },
                    signal: controller.signal,
                });
                return { status: response.status, body: await response.text() };
            } catch (error) {
                if (timedOut) {
                    throw new TimeoutError(url);
                }
                if (signal?.aborted) {
                    throw new CancelledError(url);
                }
                throw error; // a network failure: fetch throws TypeError
            } finally {
                clearTimeout(timer);
                signal?.removeEventListener('abort', onCallerAbort);
            }
        },
    };
}

/**
 * Retries network errors and HTTP 5xx with exponential back-off: `baseDelayMs`, then twice that.
 * HTTP 4xx is **not** retried (our request is wrong), and neither is a cancellation.
 */
export function withRetry(
    client: HttpClient,
    options: {
        maxRetries?: number;
        baseDelayMs?: number;
        sleep?: (ms: number) => Promise<void>;
    } = {},
): HttpClient {
    const {
        maxRetries = 2,
        baseDelayMs = 1000,
        sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
    } = options;
    return {
        async get(url, signal) {
            for (let attempt = 0; ; attempt += 1) {
                try {
                    const response = await client.get(url, signal);
                    if (response.status < 500 || attempt >= maxRetries) {
                        return response;
                    }
                } catch (error) {
                    const retryable = !(error instanceof CancelledError);
                    if (!retryable || attempt >= maxRetries) {
                        throw error;
                    }
                }
                await sleep(baseDelayMs * 2 ** attempt);
            }
        },
    };
}
