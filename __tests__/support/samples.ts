/**
 * Test helpers for the data layer. Responses come from the **recorded** files in
 * docs/api/samples (AGENTS.md: never invent API responses), replayed by a fake HttpClient,
 * so no test touches the network.
 */
import type { HttpClient } from '../../src/data/remote/httpClient';
import forecastError from '../../docs/api/samples/forecast_error.json';
import forecastIstanbul from '../../docs/api/samples/forecast_istanbul.json';
import geocodingEmpty from '../../docs/api/samples/geocoding_empty.json';
import geocodingAr from '../../docs/api/samples/geocoding_istanbul_ar.json';
import geocodingEn from '../../docs/api/samples/geocoding_istanbul_en.json';
import geocodingTr from '../../docs/api/samples/geocoding_istanbul_tr.json';

const SAMPLES = {
    'forecast_error.json': forecastError,
    'forecast_istanbul.json': forecastIstanbul,
    'geocoding_empty.json': geocodingEmpty,
    'geocoding_istanbul_ar.json': geocodingAr,
    'geocoding_istanbul_en.json': geocodingEn,
    'geocoding_istanbul_tr.json': geocodingTr,
} as const;

/** The recorded response as the text the server sent (re-serialized from the JSON file). */
export function sample(name: keyof typeof SAMPLES): string {
    return JSON.stringify(SAMPLES[name]);
}

type Reply =
    | { readonly status: number; readonly body: string }
    | { readonly error: unknown };

/** Answers each request with the next reply and remembers every URL it was asked for. */
export function replayingClient(...replies: Reply[]): HttpClient & {
    readonly urls: string[];
} {
    const urls: string[] = [];
    return {
        urls,
        async get(url) {
            urls.push(url);
            const reply = replies.shift();
            if (!reply) {
                throw new Error(`No reply left for ${url}`);
            }
            if ('error' in reply) {
                throw reply.error;
            }
            return reply;
        },
    };
}

export const ok = (body: string): Reply => ({ status: 200, body });
export const status = (code: number, body = '{}'): Reply => ({
    status: code,
    body,
});
export const networkError = (): Reply => ({
    error: new TypeError('Network request failed'),
});
