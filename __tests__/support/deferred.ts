/** A promise the test resolves when it wants: for "the answer arrives late" cases. */
export function deferred<T>() {
    let resolve: (value: T) => void = () => undefined;
    const promise = new Promise<T>(r => {
        resolve = r;
    });
    return { promise, resolve };
}

/** Lets pending promise callbacks run. */
export const settle = () => new Promise<void>(resolve => setImmediate(resolve));
