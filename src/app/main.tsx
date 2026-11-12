import React from 'react';
import { findBestLanguageTag } from 'react-native-localize';
import { version } from '../../package.json';
import {
    createAsyncStorageStore,
    createDataModule,
    nativeLocationPlatform,
} from '../data';
import { systemDateProvider } from '../domain';
import { pickLanguage } from '../presentation';
import App from './App';
import { createAppDependencies, LINKS } from './composition';
import { createNativePlatform } from './platform';

/**
 * The real entry point: the only file that creates native implementations (AsyncStorage,
 * Open-Meteo over fetch, the GPS, the phone's settings pages). Created once, at start-up.
 */
const language = pickLanguage(findBestLanguageTag);
const dependencies = createAppDependencies(
    createDataModule({
        store: createAsyncStorageStore(),
        location: nativeLocationPlatform,
        dates: systemDateProvider,
        userAgent: `Atmos-RN/${version} (+${LINKS.sourceCode})`,
    }),
    createNativePlatform(language),
    { version },
);

export default function Main(): React.JSX.Element {
    return <App dependencies={dependencies} language={language} />;
}
