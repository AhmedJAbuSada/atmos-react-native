import Geolocation from '@react-native-community/geolocation';
import { Platform } from 'react-native';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import type {
    LocationPermissionStatus,
    LocationPlatform,
} from './locationRepository';

/**
 * The real platform calls. Coarse location is enough for weather and asks the user for less
 * (PRD privacy note). Not unit-tested: it is only glue, checked by the e2e tests in step 07.
 */
export const nativeLocationPlatform: LocationPlatform = {
    async checkPermission(): Promise<LocationPermissionStatus> {
        const permission =
            Platform.OS === 'ios'
                ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                : PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION;
        const status = await check(permission);
        if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
            return 'granted';
        }
        return status === RESULTS.UNAVAILABLE ? 'unavailable' : 'denied';
    },

    currentPosition() {
        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(
                position =>
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    }),
                error => reject(new Error(error.message)),
                {
                    enableHighAccuracy: false,
                    timeout: 15_000,
                    maximumAge: 10 * 60_000,
                },
            );
        });
    },
};
