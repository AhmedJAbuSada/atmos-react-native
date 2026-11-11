/**
 * Everything that can go wrong, in the language of the business, not of the libraries
 * (ADR-0006). The data layer maps network, HTTP and parsing failures to these values; the UI
 * maps each kind to a translated message.
 */
export type DomainError =
    | { readonly kind: 'noConnection' }
    | { readonly kind: 'timeout' }
    | { readonly kind: 'server'; readonly code: number }
    | { readonly kind: 'notFound' }
    | { readonly kind: 'locationPermissionDenied' }
    | { readonly kind: 'locationUnavailable' }
    /** The work was cancelled (the screen went away). Never shown to the user. */
    | { readonly kind: 'cancelled' }
    | { readonly kind: 'unknown' };

export const DomainErrors = {
    noConnection: { kind: 'noConnection' },
    timeout: { kind: 'timeout' },
    server: (code: number): DomainError => ({ kind: 'server', code }),
    notFound: { kind: 'notFound' },
    locationPermissionDenied: { kind: 'locationPermissionDenied' },
    locationUnavailable: { kind: 'locationUnavailable' },
    cancelled: { kind: 'cancelled' },
    unknown: { kind: 'unknown' },
} as const satisfies Record<
    string,
    DomainError | ((code: number) => DomainError)
>;
