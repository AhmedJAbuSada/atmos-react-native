import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type {
    AppTheme,
    TemperatureUnit,
    UserSettings,
    WindSpeedUnit,
} from '../../domain';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { SegmentedControl } from '../components/SegmentedControl';
import { useLocalization } from '../i18n/useLocalization';
import { useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';

export interface SettingsActions {
    readonly onChange: (change: Partial<UserSettings>) => void;
    /** Opens the system page for the app language (ADR-0005: the OS owns the language). */
    readonly onOpenLanguageSettings: () => void;
    readonly onOpenAbout: () => void;
    readonly onBack: () => void;
}

const TEMPERATURE_UNITS: readonly TemperatureUnit[] = ['celsius', 'fahrenheit'];
const WIND_UNITS: readonly WindSpeedUnit[] = [
    'kilometersPerHour',
    'metersPerSecond',
    'milesPerHour',
];
const THEMES: readonly AppTheme[] = ['system', 'light', 'dark'];

/** Settings (US-08): units, theme, the way to the system language page, About. */
export function SettingsView({
    settings,
    actions,
}: {
    settings: UserSettings;
    actions: SettingsActions;
}): React.JSX.Element {
    const theme = useTheme();
    const { t } = useLocalization();
    const styles = makeStyles(theme);
    return (
        <Screen title={t('settings.title')} onBack={actions.onBack}>
            <ScrollView contentContainerStyle={styles.content}>
                <Section title={t('settings.temperature')}>
                    <SegmentedControl
                        label={t('settings.temperature')}
                        options={TEMPERATURE_UNITS.map(value => ({
                            value,
                            title: t(`settings.unit.${value}`),
                        }))}
                        selected={settings.temperatureUnit}
                        onSelect={temperatureUnit =>
                            actions.onChange({ temperatureUnit })
                        }
                        testID="settings.temperature"
                    />
                </Section>
                <Section title={t('settings.windSpeed')}>
                    <SegmentedControl
                        label={t('settings.windSpeed')}
                        options={WIND_UNITS.map(value => ({
                            value,
                            title: t(`settings.unit.${value}`),
                        }))}
                        selected={settings.windSpeedUnit}
                        onSelect={windSpeedUnit =>
                            actions.onChange({ windSpeedUnit })
                        }
                        testID="settings.wind"
                    />
                </Section>
                <Section title={t('settings.theme.title')}>
                    <SegmentedControl
                        label={t('settings.theme.title')}
                        options={THEMES.map(value => ({
                            value,
                            title: t(`settings.theme.${value}`),
                        }))}
                        selected={settings.theme}
                        onSelect={choice => actions.onChange({ theme: choice })}
                        testID="settings.theme"
                    />
                </Section>
                <Section title={t('settings.language.title')}>
                    <Text style={styles.footer}>
                        {t('settings.language.footer')}
                    </Text>
                    <Button
                        title={t('settings.language.open')}
                        onPress={actions.onOpenLanguageSettings}
                        testID="settings.language"
                    />
                </Section>
                <Pressable
                    accessibilityRole="button"
                    onPress={actions.onOpenAbout}
                    style={styles.link}
                    testID="settings.about"
                >
                    <Text style={styles.linkText}>{t('settings.about')}</Text>
                </Pressable>
            </ScrollView>
        </Screen>
    );
}

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}): React.JSX.Element {
    const theme = useTheme();
    const styles = makeStyles(theme);
    return (
        <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
                {title}
            </Text>
            {children}
        </View>
    );
}

function makeStyles(theme: Theme) {
    const { colors, spacing, fontSize, radius } = theme;
    return StyleSheet.create({
        content: { padding: spacing.m, gap: spacing.m },
        section: {
            backgroundColor: colors.surface,
            borderRadius: radius.m,
            padding: spacing.m,
            gap: spacing.s,
        },
        sectionTitle: {
            color: colors.text,
            fontSize: fontSize.body,
            fontWeight: '600',
        },
        footer: { color: colors.secondaryText, fontSize: fontSize.caption },
        link: {
            minHeight: theme.minTouchTarget,
            justifyContent: 'center',
            backgroundColor: colors.surface,
            borderRadius: radius.m,
            paddingHorizontal: spacing.m,
        },
        linkText: { color: colors.accent, fontSize: fontSize.body },
    });
}
