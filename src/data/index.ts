/**
 * # src/data
 *
 * Talks to the outside world (Open-Meteo, AsyncStorage, location) and implements the
 * repository interfaces declared in `src/domain`. This file is the layer's public surface:
 * only the composition root imports it, and it exports **no DTO and no concrete repository**.
 */
export {
    createDataModule,
    type DataModule,
    type DataModuleOptions,
} from './dataModule';
export { createAsyncStorageStore } from './local/asyncStorageStore';
export { nativeLocationPlatform } from './location/nativeLocation';
