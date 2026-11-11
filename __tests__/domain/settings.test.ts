import { DEFAULT_SETTINGS, temperatureIn, windSpeedIn } from '../../src/domain';
import { FakeSettingsRepository } from '../../src/testing';

describe('units', () => {
    it.each([
        [0, 32],
        [100, 212],
        [-40, -40],
    ])('%p °C is %p °F', (celsius, fahrenheit) => {
        expect(temperatureIn({ celsius }, 'fahrenheit')).toBeCloseTo(
            fahrenheit,
        );
    });

    it('celsius is returned unchanged', () => {
        expect(temperatureIn({ celsius: 14.9 }, 'celsius')).toBe(14.9);
    });

    it('wind speed converts to every unit', () => {
        const wind = { kilometersPerHour: 36 };
        expect(windSpeedIn(wind, 'kilometersPerHour')).toBe(36);
        expect(windSpeedIn(wind, 'metersPerSecond')).toBeCloseTo(10);
        expect(windSpeedIn(wind, 'milesPerHour')).toBeCloseTo(22.369);
    });
});

describe('settings', () => {
    it('first run uses metric units and follows the system theme', () => {
        expect(DEFAULT_SETTINGS).toEqual({
            temperatureUnit: 'celsius',
            windSpeedUnit: 'kilometersPerHour',
            theme: 'system',
        });
    });

    it('observers receive every change', async () => {
        const repository = new FakeSettingsRepository();
        const seen: string[] = [];
        repository.observeSettings(settings =>
            seen.push(settings.temperatureUnit),
        );

        await repository.updateSettings({ temperatureUnit: 'fahrenheit' });

        expect(seen).toEqual(['celsius', 'fahrenheit']);
    });
});
