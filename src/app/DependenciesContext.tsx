import React, { createContext, useContext } from 'react';
import type { AppDependencies } from './composition';

const DependenciesContext = createContext<AppDependencies | undefined>(
    undefined,
);

/** Hands the object graph from the composition root to the screens (ADR-0004). */
export function DependenciesProvider({
    dependencies,
    children,
}: {
    dependencies: AppDependencies;
    children: React.ReactNode;
}): React.JSX.Element {
    return (
        <DependenciesContext.Provider value={dependencies}>
            {children}
        </DependenciesContext.Provider>
    );
}

export function useDependencies(): AppDependencies {
    const dependencies = useContext(DependenciesContext);
    if (!dependencies) {
        throw new Error(
            'useDependencies() must be used inside <DependenciesProvider>.',
        );
    }
    return dependencies;
}
