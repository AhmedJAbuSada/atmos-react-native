/** Stops a subscription. */
export type Unsubscribe = () => void;

/**
 * Holds a current value and tells subscribers about every change: the TypeScript equivalent of
 * Kotlin's `StateFlow` and the iOS `ValueStream`. A new subscriber receives the current value
 * at once.
 */
export class ValueStore<T> {
    private listeners = new Set<(value: T) => void>();

    constructor(
        private current: T,
        private readonly equals: (a: T, b: T) => boolean = Object.is,
    ) {}

    get(): T {
        return this.current;
    }

    /** Replaces the value and notifies subscribers, unless nothing changed. */
    set(value: T): void {
        if (this.equals(value, this.current)) {
            return;
        }
        this.current = value;
        this.listeners.forEach(listener => listener(value));
    }

    subscribe(listener: (value: T) => void): Unsubscribe {
        this.listeners.add(listener);
        listener(this.current);
        return () => {
            this.listeners.delete(listener);
        };
    }
}
