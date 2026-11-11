import type { AppTheme } from '../../domain';

/**
 * Design tokens: every colour, size and spacing the screens use, in one place. Screens never
 * write `#1C6DD0` or `16`; they write `theme.colors.accent` and `theme.spacing.m`, so dark mode
 * and a redesign change this file only.
 */
export interface Theme {
    readonly dark: boolean;
    readonly colors: {
        readonly background: string;
        readonly surface: string;
        readonly text: string;
        readonly secondaryText: string;
        readonly accent: string;
        readonly onAccent: string;
        readonly separator: string;
        readonly warningBackground: string;
        readonly warningText: string;
        readonly skeleton: string;
    };
    readonly spacing: {
        readonly xs: 4;
        readonly s: 8;
        readonly m: 16;
        readonly l: 24;
        readonly xl: 32;
    };
    readonly radius: { readonly s: 8; readonly m: 12; readonly l: 20 };
    readonly fontSize: {
        readonly caption: 13;
        readonly body: 16;
        readonly title: 20;
        readonly headline: 28;
        readonly display: 72;
    };
    /** The smallest touch target (Android 48 dp, Apple 44 pt): the larger one, on both. */
    readonly minTouchTarget: 48;
}

const shared = {
    spacing: { xs: 4, s: 8, m: 16, l: 24, xl: 32 },
    radius: { s: 8, m: 12, l: 20 },
    fontSize: { caption: 13, body: 16, title: 20, headline: 28, display: 72 },
    minTouchTarget: 48,
} as const;

// Text colours meet WCAG AA (4.5:1) on their backgrounds (NF-03).
export const lightTheme: Theme = {
    dark: false,
    colors: {
        background: '#F4F7FB',
        surface: '#FFFFFF',
        text: '#111827',
        secondaryText: '#4B5563',
        accent: '#1D5FBF',
        onAccent: '#FFFFFF',
        separator: '#D9DEE7',
        warningBackground: '#FFF4D6',
        warningText: '#7A4B00',
        skeleton: '#E3E8EF',
    },
    ...shared,
};

export const darkTheme: Theme = {
    dark: true,
    colors: {
        background: '#0D1420',
        surface: '#182233',
        text: '#F3F4F6',
        secondaryText: '#B6BFCC',
        accent: '#7DB2FF',
        onAccent: '#0D1420',
        separator: '#2B3648',
        warningBackground: '#3D2E0A',
        warningText: '#FFD98A',
        skeleton: '#243047',
    },
    ...shared,
};

/** The user's choice wins; "system" follows the phone (US-08). */
export function resolveTheme(
    choice: AppTheme,
    systemScheme: 'light' | 'dark' | null | undefined,
): Theme {
    const dark =
        choice === 'dark' || (choice === 'system' && systemScheme === 'dark');
    return dark ? darkTheme : lightTheme;
}
