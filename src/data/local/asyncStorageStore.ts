import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import type { KeyValueStore } from './keyValueStore';

/** The real store (ADR-0007): one AsyncStorage database for the whole app. */
export function createAsyncStorageStore(databaseName = 'atmos'): KeyValueStore {
    return createAsyncStorage(databaseName);
}
