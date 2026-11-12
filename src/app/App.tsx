import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { I18nManager, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useStore } from 'zustand';
import { AppProviders, resolveTheme, type AppLanguage } from '../presentation';
import type { AppDependencies } from './composition';
import { DependenciesProvider } from './DependenciesContext';
import { RootNavigator } from './navigation';

// Arabic lays the app out right to left. The OS decides the language (ADR-0005), so the
// direction follows it; React Native applies it at start-up.
I18nManager.allowRTL(true);

/**
 * The app around the screens: translations, theme, dependencies, navigation. It receives the
 * object graph instead of creating it, so the journey test runs this exact component with fakes.
 */
export default function App({
    dependencies,
    language,
}: {
    dependencies: AppDependencies;
    language: AppLanguage;
}): React.JSX.Element {
    // The settings view model lives as long as the app: the theme on every screen follows it.
    useEffect(() => dependencies.settings.start(), [dependencies]);
    const { theme: themeChoice } = useStore(dependencies.settings.store);
    const theme = resolveTheme(themeChoice, useColorScheme());

    return (
        <SafeAreaProvider>
            <AppProviders language={language} theme={theme}>
                <DependenciesProvider dependencies={dependencies}>
                    <NavigationContainer>
                        <RootNavigator />
                    </NavigationContainer>
                </DependenciesProvider>
            </AppProviders>
        </SafeAreaProvider>
    );
}
