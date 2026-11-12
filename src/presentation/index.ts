/**
 * # src/presentation
 *
 * What the user sees: props-only views, the theme, formatting and translations. Views take a
 * `state` value and callbacks; view models (Zustand stores) produce the state, and containers
 * (`HomeScreen`, …) connect one to the other.
 */
export { AppProviders } from './AppProviders';
export { pickLanguage, isRightToLeft, type AppLanguage } from './i18n/language';
export { resolveTheme, lightTheme, darkTheme, type Theme } from './theme/theme';
export { HomeView } from './home/HomeView';
export type { HomeState, HomeContent, HomeActions } from './home/homeState';
export { CitiesView } from './cities/CitiesView';
export type {
    CitiesState,
    CitiesActions,
    PlaceItem,
    SearchState,
    CitiesNotice,
} from './cities/citiesState';
export { SettingsView, type SettingsActions } from './settings/SettingsView';
export { AboutView, type AboutActions } from './settings/AboutView';
export { HomeScreen } from './home/HomeScreen';
export { CitiesScreen } from './cities/CitiesScreen';
export { SettingsScreen } from './settings/SettingsScreen';
export * from './viewModels';
