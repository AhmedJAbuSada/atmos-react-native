import { DomainErrors, type DomainError } from '../../domain';
import { CancelledError, HttpStatusError, TimeoutError } from './httpClient';

/** The server answered, but without something we cannot do without. */
export class InvalidResponseError extends Error {
    override readonly name = 'InvalidResponseError';
}

/**
 * Translates any failure from the network, HTTP or JSON into a DomainError. The **only** place
 * that knows about these error classes (ADR-0006). Cancellation is never reported as offline.
 */
export function toDomainError(error: unknown): DomainError {
    if (error instanceof CancelledError) {
        return DomainErrors.cancelled;
    }
    if (error instanceof TimeoutError) {
        return DomainErrors.timeout;
    }
    if (error instanceof HttpStatusError) {
        return error.status === 404
            ? DomainErrors.notFound
            : DomainErrors.server(error.status);
    }
    // fetch rejects with a TypeError when there is no network at all.
    if (error instanceof TypeError) {
        return DomainErrors.noConnection;
    }
    return DomainErrors.unknown; // SyntaxError (bad JSON), InvalidResponseError, anything else
}
