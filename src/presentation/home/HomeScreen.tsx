import React, { useEffect } from 'react';
import { useStore } from 'zustand';
import type { HomeViewModel } from '../viewModels/homeViewModel';
import { HomeView } from './HomeView';

/**
 * The container: connects the Home view model to the props-only {@link HomeView}. It starts the
 * view model while the screen is mounted and stops it when the screen goes away.
 */
export function HomeScreen({
    viewModel,
    onOpenCities,
    onOpenSettings,
}: {
    viewModel: HomeViewModel;
    onOpenCities: () => void;
    onOpenSettings: () => void;
}): React.JSX.Element {
    const state = useStore(viewModel.store);
    useEffect(() => viewModel.start(), [viewModel]);
    return (
        <HomeView
            state={state}
            actions={{
                onRefresh: () => viewModel.refresh(),
                onRetry: () => viewModel.retry(),
                onRequestLocation: () => viewModel.requestLocation(),
                onOpenCities,
                onOpenSettings,
            }}
        />
    );
}
