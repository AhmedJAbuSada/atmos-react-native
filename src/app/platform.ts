import { Linking, Platform } from 'react-native';
import { openAppLanguageSettings } from 'react-native-localize';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { systemDateProvider } from '../domain';
import type { PermissionAnswer } from '../presentation';
import type { AppPlatform } from './composition';

/**
 * The real phone calls. Only glue: the decisions (when to ask, what to show) are in the view
 * models, tested with fakes. The end-to-end tests in step 07 run this code on a device.
 */
export function createNativePlatform(languageCode: string): AppPlatform {
    return {
        dates: systemDateProvider,
        languageCode: () => languageCode,

        async requestLocationPermission(): Promise<PermissionAnswer> {
            const permission =
                Platform.OS === 'ios'
                    ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                    : PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION;
            const status = await request(permission);
            if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
                return 'granted';
            }
            return status === RESULTS.BLOCKED ? 'blocked' : 'denied';
        },

        openAppSettings: () => {
            Linking.openSettings().catch(() => undefined);
        },

        // Android 12 and older have no per-app language page: the app settings are the closest.
        openLanguageSettings: () => {
            openAppLanguageSettings().catch(() =>
                Linking.openSettings().catch(() => undefined),
            );
        },

        openUrl: url => {
            Linking.openURL(url).catch(() => undefined);
        },
    };
}
