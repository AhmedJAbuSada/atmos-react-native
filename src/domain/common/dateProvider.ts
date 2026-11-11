/**
 * Where "now" comes from, as milliseconds since 1970. Injected instead of calling `Date.now()`,
 * so tests can control time ("data fetched exactly 30 minutes ago is stale") without waiting.
 */
export interface DateProvider {
    now(): number;
}

export const systemDateProvider: DateProvider = { now: () => Date.now() };
