import {
    assertNever,
    failure,
    success,
    ValueStore,
    DomainErrors,
} from '../../src/domain';

describe('Result', () => {
    it('narrows to the value or the error', () => {
        const ok = success(42);
        const bad = failure<number>(DomainErrors.timeout);
        expect(ok.ok && ok.value).toBe(42);
        expect(!bad.ok && bad.error.kind).toBe('timeout');
    });

    it('assertNever fails loudly for an unexpected value', () => {
        expect(() => assertNever('surprise' as never)).toThrow(
            'Unexpected value',
        );
    });
});

describe('ValueStore', () => {
    it('gives a new subscriber the current value at once', () => {
        const store = new ValueStore(1);
        store.set(2);
        const seen: number[] = [];
        store.subscribe(value => seen.push(value));
        expect(seen).toEqual([2]);
    });

    it('notifies every subscriber of each change, but not of an unchanged value', () => {
        const store = new ValueStore('a');
        const first: string[] = [];
        const second: string[] = [];
        store.subscribe(value => first.push(value));
        store.subscribe(value => second.push(value));

        store.set('a');
        store.set('b');

        expect(first).toEqual(['a', 'b']);
        expect(second).toEqual(['a', 'b']);
    });

    it('stops notifying after unsubscribe', () => {
        const store = new ValueStore(0);
        const seen: number[] = [];
        const unsubscribe = store.subscribe(value => seen.push(value));
        unsubscribe();
        store.set(1);
        expect(seen).toEqual([0]);
    });
});
