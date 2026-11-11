import {
    createWeatherFormatter,
    isolate,
    updatedAgo,
} from '../../src/presentation/formatting/weatherFormatter';

const LRI = '⁦';
const PDI = '⁩';
const plain = (text: string) => text.replace(/[⁦⁩]/g, '');

const en = createWeatherFormatter('en', 'Europe/Istanbul');
const tr = createWeatherFormatter('tr', 'Europe/Istanbul');
const ar = createWeatherFormatter('ar', 'Europe/Istanbul');

// 2026-11-11 14:00 in Istanbul (UTC+3).
const AFTERNOON = Date.UTC(2026, 10, 11, 11, 0);

describe('WeatherFormatter', () => {
    test('every value is wrapped in directional isolates, so Arabic cannot reorder it', () => {
        expect(ar.temperature({ celsius: 11 }, 'celsius')).toBe(
            `${LRI}11°${PDI}`,
        );
        expect(isolate('x')).toBe(`${LRI}x${PDI}`);
    });

    test('temperatures are whole degrees, converted only for display', () => {
        expect(plain(en.temperature({ celsius: 14.9 }, 'celsius'))).toBe('15°');
        expect(plain(en.temperature({ celsius: 15 }, 'fahrenheit'))).toBe(
            '59°',
        );
        expect(plain(en.temperature({ celsius: -0.4 }, 'celsius'))).toBe('0°'); // never "-0°"
    });

    test('Turkish puts the percent sign first and uses a decimal comma', () => {
        expect(plain(tr.percentage(69))).toBe('%69');
        expect(
            plain(tr.windSpeed({ kilometersPerHour: 24.8 }, 'metersPerSecond')),
        ).toBe('6,9 m/s');
    });

    test('Arabic uses Latin digits (product decision, ADR-0005)', () => {
        expect(plain(ar.temperature({ celsius: 15 }, 'celsius'))).toBe('15°');
        expect(
            plain(
                ar.windSpeed({ kilometersPerHour: 24.8 }, 'kilometersPerHour'),
            ),
        ).toBe('25 km/h');
        expect(ar.hour(AFTERNOON)).not.toMatch(/[٠-٩]/); // no Arabic-Indic digits
    });

    test('wind speed in each unit', () => {
        const wind = { kilometersPerHour: 24.8 };
        expect(plain(en.windSpeed(wind, 'kilometersPerHour'))).toBe('25 km/h');
        expect(plain(en.windSpeed(wind, 'metersPerSecond'))).toBe('6.9 m/s');
        expect(plain(en.windSpeed(wind, 'milesPerHour'))).toBe('15 mph');
    });

    test('hours are shown at the place, in the language style', () => {
        expect(plain(en.hour(AFTERNOON))).toMatch(/^2:00\sPM$/);
        expect(plain(tr.hour(AFTERNOON))).toBe('14:00');
        // Turkish writes a leading zero: 07:46, not 7:46 (found by the Home view test).
        expect(plain(tr.hour(Date.UTC(2026, 10, 11, 4, 46)))).toBe('07:46');
        const london = createWeatherFormatter('en', 'Europe/London');
        expect(plain(london.hour(AFTERNOON))).toMatch(/^11:00\sAM$/);
    });

    test('day names in each language', () => {
        expect(en.dayName(AFTERNOON)).toBe('Wednesday');
        expect(tr.dayName(AFTERNOON)).toBe('Çarşamba');
        expect(ar.dayName(AFTERNOON)).toBe('الأربعاء');
    });

    test('"same day" is decided at the place, not on the phone', () => {
        const lateEvening = Date.UTC(2026, 10, 11, 20, 30); // 23:30 in Istanbul
        const afterMidnight = Date.UTC(2026, 10, 11, 21, 30); // 00:30 next day in Istanbul
        expect(en.sameDay(AFTERNOON, lateEvening)).toBe(true);
        expect(en.sameDay(lateEvening, afterMidnight)).toBe(false);
    });
});

describe('updatedAgo', () => {
    test.each([
        [0, 'home.updatedMinutes', 0],
        [59 * 60_000, 'home.updatedMinutes', 59],
        [2 * 3_600_000 + 5 * 60_000, 'home.updatedHours', 2],
        [26 * 3_600_000, 'home.updatedDays', 1],
        [-5_000, 'home.updatedMinutes', 0], // a clock that went backwards
    ])('%p ms → %s (%p)', (age, key, count) => {
        expect(updatedAgo(age)).toEqual({ key, count });
    });
});
