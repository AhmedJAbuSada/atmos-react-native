/**
 * The composition root (ADR-0004): the one place that creates the real implementations and
 * wires repositories → use cases → view models. Everything else receives its dependencies as
 * arguments. In step 04 it creates the real data layer; use cases and view models join in
 * step 06.
 */
import {
    createAsyncStorageStore,
    createDataModule,
    nativeLocationPlatform,
    type DataModule,
} from '../data';
import { systemDateProvider } from '../domain';

export type Dependencies = DataModule;

export function createDependencies(): Dependencies {
    return createDataModule({
        store: createAsyncStorageStore(),
        location: nativeLocationPlatform,
        dates: systemDateProvider,
        userAgent:
            'Atmos-RN/1.0 (+https://github.com/AhmedJAbuSada/atmos-react-native)',
    });
}
