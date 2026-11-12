import {
    createNativeStackNavigator,
    type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import React from 'react';
import {
    AboutView,
    CitiesScreen,
    HomeScreen,
    SettingsScreen,
} from '../presentation';
import { LINKS } from './composition';
import { useDependencies } from './DependenciesContext';

/**
 * Every route and its parameters (ADR-0008). `navigation.navigate('Citys')` is a compile
 * error, not a crash. No route takes parameters: the selected place is shared state, not a
 * route argument, so Home always shows what Cities picked.
 */
export type RootStackParamList = {
    Home: undefined;
    Cities: undefined;
    Settings: undefined;
    About: undefined;
};

type Props<Route extends keyof RootStackParamList> = NativeStackScreenProps<
    RootStackParamList,
    Route
>;

const Stack = createNativeStackNavigator<RootStackParamList>();

function HomeRoute({ navigation }: Props<'Home'>): React.JSX.Element {
    const { home } = useDependencies();
    return (
        <HomeScreen
            viewModel={home}
            onOpenCities={() => navigation.navigate('Cities')}
            onOpenSettings={() => navigation.navigate('Settings')}
        />
    );
}

function CitiesRoute({ navigation }: Props<'Cities'>): React.JSX.Element {
    const { cities } = useDependencies();
    return (
        <CitiesScreen viewModel={cities} onBack={() => navigation.goBack()} />
    );
}

function SettingsRoute({ navigation }: Props<'Settings'>): React.JSX.Element {
    const { settings, platform } = useDependencies();
    return (
        <SettingsScreen
            viewModel={settings}
            onOpenLanguageSettings={platform.openLanguageSettings}
            onOpenAbout={() => navigation.navigate('About')}
            onBack={() => navigation.goBack()}
        />
    );
}

function AboutRoute({ navigation }: Props<'About'>): React.JSX.Element {
    const { platform, version } = useDependencies();
    return (
        <AboutView
            version={version}
            actions={{
                onOpenDataSource: () => platform.openUrl(LINKS.dataSource),
                onOpenSourceCode: () => platform.openUrl(LINKS.sourceCode),
                onBack: () => navigation.goBack(),
            }}
        />
    );
}

/** The screens draw their own top bar (step 05), so the native header is hidden. */
export function RootNavigator(): React.JSX.Element {
    return (
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen name="Home" component={HomeRoute} />
            <Stack.Screen name="Cities" component={CitiesRoute} />
            <Stack.Screen name="Settings" component={SettingsRoute} />
            <Stack.Screen name="About" component={AboutRoute} />
        </Stack.Navigator>
    );
}
