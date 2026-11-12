import React, { useEffect } from 'react';
import { useStore } from 'zustand';
import type { CitiesViewModel } from '../viewModels/citiesViewModel';
import { CitiesView } from './CitiesView';

/** The container for {@link CitiesView}. Picking a place selects it and goes back to Home. */
export function CitiesScreen({
    viewModel,
    onBack,
}: {
    viewModel: CitiesViewModel;
    onBack: () => void;
}): React.JSX.Element {
    const state = useStore(viewModel.store);
    useEffect(() => viewModel.start(), [viewModel]);
    return (
        <CitiesView
            state={state}
            actions={{
                onQueryChange: query => viewModel.queryChanged(query),
                onRetrySearch: () => viewModel.retrySearch(),
                onAdd: city => viewModel.add(city),
                onRemove: city => viewModel.remove(city),
                onSelect: place => {
                    viewModel.select(place);
                    onBack();
                },
                onUndo: () => viewModel.undo(),
                onBack,
            }}
        />
    );
}
