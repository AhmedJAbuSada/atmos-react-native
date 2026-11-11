import React from 'react';
import { I18nManager, useColorScheme } from 'react-native';
import { findBestLanguageTag } from 'react-native-localize';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
    AppProviders,
    HomeView,
    pickLanguage,
    resolveTheme,
    type HomeActions,
} from '../presentation';

// Arabic lays the app out right to left. The OS decides the language (ADR-0005), so the
// direction follows it; React Native applies it at start-up.
I18nManager.allowRTL(true);

/** Step 05 shows the views with fixed states; view models and navigation arrive in step 06. */
const NO_ACTIONS: HomeActions = {
    onRefresh: () => undefined,
    onRetry: () => undefined,
    onRequestLocation: () => undefined,
    onOpenCities: () => undefined,
    onOpenSettings: () => undefined,
};

/** The app's root component. */
export default function App(): React.JSX.Element {
    const language = pickLanguage(findBestLanguageTag);
    const theme = resolveTheme('system', useColorScheme());
    return (
        <SafeAreaProvider>
            <AppProviders language={language} theme={theme}>
                <HomeView
                    state={{ kind: 'needsLocation' }}
                    actions={NO_ACTIONS}
                />
            </AppProviders>
        </SafeAreaProvider>
    );
}
