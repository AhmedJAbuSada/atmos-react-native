/**
 * The composition root (ADR-0004): the one place that creates the real implementations and
 * wires repositories → use cases → view models. Everything else receives its dependencies as
 * arguments. In step 02 there is nothing to wire yet.
 */
export type Dependencies = Record<string, never>;

export function createDependencies(): Dependencies {
    return {};
}
