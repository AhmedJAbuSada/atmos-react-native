import {
    DomainErrors,
    failure,
    makeCoordinates,
    success,
    type LocationRepository,
} from '../../domain';

/** The permission states this repository cares about. */
export type LocationPermissionStatus = 'granted' | 'denied' | 'unavailable';

/**
 * The two platform calls, injected so the logic is tested without a phone. The real ones are
 * in `nativeLocation.ts`.
 */
export interface LocationPlatform {
    checkPermission(): Promise<LocationPermissionStatus>;
    currentPosition(): Promise<{ latitude: number; longitude: number }>;
}

/**
 * Only **checks** the permission. Asking for it is a UI decision (US-01: the app explains why
 * first), so it happens in the presentation layer, not here.
 */
export function createLocationRepository(
    platform: LocationPlatform,
): LocationRepository {
    return {
        async currentLocation() {
            try {
                const status = await platform.checkPermission();
                if (status === 'denied') {
                    return failure(DomainErrors.locationPermissionDenied);
                }
                if (status === 'unavailable') {
                    return failure(DomainErrors.locationUnavailable);
                }
                const { latitude, longitude } =
                    await platform.currentPosition();
                const coordinates = makeCoordinates(latitude, longitude);
                return coordinates
                    ? success(coordinates)
                    : failure(DomainErrors.locationUnavailable);
            } catch {
                return failure(DomainErrors.locationUnavailable); // timeout, GPS off, no fix
            }
        },
    };
}
