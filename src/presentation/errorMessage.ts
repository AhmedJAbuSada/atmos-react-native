import { assertNever, type DomainError } from '../domain';

/**
 * The message for each error, as an i18n key. `cancelled` has **no** message: the user left,
 * so there is nothing to tell them (ADR-0006). The `switch` with `assertNever` makes a new
 * error kind a compile error here until it has a message.
 */
export function errorMessageKey(error: DomainError) {
    switch (error.kind) {
        case 'noConnection':
            return 'error.noConnection' as const;
        case 'timeout':
            return 'error.timeout' as const;
        case 'server':
            return 'error.server' as const;
        case 'notFound':
            return 'error.notFound' as const;
        case 'locationPermissionDenied':
            return 'error.locationDenied' as const;
        case 'locationUnavailable':
            return 'error.locationUnavailable' as const;
        case 'unknown':
            return 'error.unknown' as const;
        case 'cancelled':
            return undefined;
        default:
            return assertNever(error);
    }
}
