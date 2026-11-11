/** The few storage operations the data layer needs (ADR-0007). */
export interface KeyValueStore {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
}

/** For tests, and a safe fallback: keeps everything in memory. */
export function createInMemoryStore(
    initial: Record<string, string> = {},
): KeyValueStore & {
    readonly entries: Map<string, string>;
} {
    const entries = new Map(Object.entries(initial));
    return {
        entries,
        getItem: async key => entries.get(key) ?? null,
        setItem: async (key, value) => {
            entries.set(key, value);
        },
    };
}

/** Reads a JSON value; missing **or unreadable** data is `undefined`, never a crash. */
export async function readJson<T>(
    store: KeyValueStore,
    key: string,
): Promise<T | undefined> {
    try {
        const raw = await store.getItem(key);
        return raw === null ? undefined : (JSON.parse(raw) as T);
    } catch {
        return undefined;
    }
}
