import {
    darkTheme,
    lightTheme,
    resolveTheme,
} from '../../src/presentation/theme/theme';

/** WCAG relative luminance and contrast ratio. */
function contrast(foreground: string, background: string): number {
    const luminance = (hex: string) => {
        const [r, g, b] = [1, 3, 5].map(i => {
            const c = parseInt(hex.slice(i, i + 2), 16) / 255;
            return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        }) as [number, number, number];
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const [light, dark] = [luminance(foreground), luminance(background)].sort(
        (a, b) => b - a,
    ) as [number, number];
    return (light + 0.05) / (dark + 0.05);
}

describe('theme', () => {
    test('the user choice wins over the system', () => {
        expect(resolveTheme('dark', 'light')).toBe(darkTheme);
        expect(resolveTheme('light', 'dark')).toBe(lightTheme);
    });

    test('"system" follows the phone, light when it does not say', () => {
        expect(resolveTheme('system', 'dark')).toBe(darkTheme);
        expect(resolveTheme('system', null)).toBe(lightTheme);
    });

    test.each([
        ['light', lightTheme],
        ['dark', darkTheme],
    ])('%s text meets WCAG AA contrast (NF-03)', (_name, theme) => {
        const { colors } = theme;
        expect(contrast(colors.text, colors.background)).toBeGreaterThanOrEqual(
            4.5,
        );
        expect(contrast(colors.text, colors.surface)).toBeGreaterThanOrEqual(
            4.5,
        );
        expect(
            contrast(colors.secondaryText, colors.surface),
        ).toBeGreaterThanOrEqual(4.5);
        expect(contrast(colors.accent, colors.surface)).toBeGreaterThanOrEqual(
            4.5,
        );
        expect(contrast(colors.onAccent, colors.accent)).toBeGreaterThanOrEqual(
            4.5,
        );
        expect(
            contrast(colors.warningText, colors.warningBackground),
        ).toBeGreaterThanOrEqual(4.5);
    });
});
