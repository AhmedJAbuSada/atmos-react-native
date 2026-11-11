import type { DomainError } from './domainError';

/**
 * The result of an operation that can fail, with a typed error instead of an exception
 * (ADR-0006). TypeScript narrows it with `if (result.ok)`:
 *
 * ```ts
 * const result = await getForecast(coordinates);
 * if (result.ok) show(result.value); else showError(result.error);
 * ```
 */
export type Result<T> =
    | { readonly ok: true; readonly value: T }
    | { readonly ok: false; readonly error: DomainError };

export const success = <T>(value: T): Result<T> => ({ ok: true, value });

export const failure = <T = never>(error: DomainError): Result<T> => ({
    ok: false,
    error,
});

/** Turns a "this cannot happen" case into a compile error when a union grows. */
export function assertNever(value: never): never {
    throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}
