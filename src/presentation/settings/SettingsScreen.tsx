import React from 'react';
import { useStore } from 'zustand';
import type { SettingsViewModel } from '../viewModels/settingsViewModel';
import { SettingsView } from './SettingsView';

/**
 * The container for {@link SettingsView}. The settings view model is started by the app root,
 * not here: the theme on every screen follows it.
 */
export function SettingsScreen({
    viewModel,
    onOpenLanguageSettings,
    onOpenAbout,
    onBack,
}: {
    viewModel: SettingsViewModel;
    onOpenLanguageSettings: () => void;
    onOpenAbout: () => void;
    onBack: () => void;
}): React.JSX.Element {
    const settings = useStore(viewModel.store);
    return (
        <SettingsView
            settings={settings}
            actions={{
                onChange: change => viewModel.change(change),
                onOpenLanguageSettings,
                onOpenAbout,
                onBack,
            }}
        />
    );
}
