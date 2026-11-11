import { DomainErrors } from '../../src/domain';
import {
    createLocationRepository,
    type LocationPermissionStatus,
} from '../../src/data/location/locationRepository';

const platform = (
    permission: LocationPermissionStatus,
    position: () => Promise<{
        latitude: number;
        longitude: number;
    }> = async () => ({
        latitude: 41.01,
        longitude: 28.97,
    }),
) => {
    const currentPosition = jest.fn(position);
    return {
        currentPosition,
        repository: createLocationRepository({
            checkPermission: async () => permission,
            currentPosition,
        }),
    };
};

describe('LocationRepository', () => {
    test('given permission, then returns the position', async () => {
        const result = await platform('granted').repository.currentLocation();
        expect(result.ok && result.value).toEqual({
            latitude: 41.01,
            longitude: 28.97,
        });
    });

    test('given no permission, then fails without asking for the position', async () => {
        const { repository, currentPosition } = platform('denied');
        await expect(repository.currentLocation()).resolves.toEqual({
            ok: false,
            error: DomainErrors.locationPermissionDenied,
        });
        expect(currentPosition).not.toHaveBeenCalled();
    });

    test('given a device without location, then fails with locationUnavailable', async () => {
        await expect(
            platform('unavailable').repository.currentLocation(),
        ).resolves.toEqual({
            ok: false,
            error: DomainErrors.locationUnavailable,
        });
    });

    test('given no fix in time, then fails with locationUnavailable', async () => {
        const { repository } = platform('granted', async () => {
            throw new Error('Location request timed out');
        });
        await expect(repository.currentLocation()).resolves.toEqual({
            ok: false,
            error: DomainErrors.locationUnavailable,
        });
    });

    test('given impossible coordinates from the platform, then fails instead of using them', async () => {
        const { repository } = platform('granted', async () => ({
            latitude: 999,
            longitude: 0,
        }));
        await expect(repository.currentLocation()).resolves.toEqual({
            ok: false,
            error: DomainErrors.locationUnavailable,
        });
    });
});
