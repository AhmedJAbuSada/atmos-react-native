import React from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import type {
    DailyForecast,
    Forecast,
    HourlyForecast,
    UserSettings,
} from '../../domain';
import { IconButton } from '../components/Button';
import { MessageView } from '../components/MessageView';
import { Screen } from '../components/Screen';
import { errorMessageKey } from '../errorMessage';
import {
    updatedAgo,
    type WeatherFormatter,
} from '../formatting/weatherFormatter';
import { useFormatter, useLocalization } from '../i18n/useLocalization';
import { useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { conditionIcon, conditionLabelKey } from '../weather/conditionUi';
import type { HomeActions, HomeContent, HomeState } from './homeState';

/** Home (US-01, US-02, US-03, US-07): props in, callbacks out, no store, no navigation. */
export function HomeView({
    state,
    actions,
}: {
    state: HomeState;
    actions: HomeActions;
}): React.JSX.Element {
    const { t } = useLocalization();
    const title =
        state.kind === 'content'
            ? state.content.placeName ?? t('home.currentLocation')
            : undefined;
    return (
        <Screen
            title={title}
            start={
                <IconButton
                    icon="☰"
                    label={t('home.openCities')}
                    onPress={actions.onOpenCities}
                    testID="home.openCities"
                />
            }
            end={
                <IconButton
                    icon="⚙︎"
                    label={t('home.openSettings')}
                    onPress={actions.onOpenSettings}
                    testID="home.openSettings"
                />
            }
        >
            <HomeBody state={state} actions={actions} />
        </Screen>
    );
}

function HomeBody({
    state,
    actions,
}: {
    state: HomeState;
    actions: HomeActions;
}): React.JSX.Element | null {
    const { t } = useLocalization();
    switch (state.kind) {
        case 'loading':
            return <HomeSkeleton />;
        case 'needsLocation':
            return (
                <MessageView
                    icon="📍"
                    title={t('home.noLocation.title')}
                    message={t('home.noLocation.message')}
                    action={{
                        title: t('home.allowLocation'),
                        onPress: actions.onRequestLocation,
                    }}
                    secondaryAction={{
                        title: t('home.searchCity'),
                        onPress: actions.onOpenCities,
                    }}
                />
            );
        case 'failed': {
            const key = errorMessageKey(state.error);
            // A cancelled load is never shown (ADR-0006): keep the skeleton.
            return key ? (
                <MessageView
                    icon="⚠️"
                    message={t(key)}
                    action={{
                        title: t('action.retry'),
                        onPress: actions.onRetry,
                    }}
                    secondaryAction={{
                        title: t('home.searchCity'),
                        onPress: actions.onOpenCities,
                    }}
                />
            ) : (
                <HomeSkeleton />
            );
        }
        case 'content':
            return (
                <HomeForecast
                    content={state.content}
                    onRefresh={actions.onRefresh}
                />
            );
    }
}

function HomeForecast({
    content,
    onRefresh,
}: {
    content: HomeContent;
    onRefresh: () => void;
}): React.JSX.Element {
    const theme = useTheme();
    const { t } = useLocalization();
    const { forecast, settings } = content;
    const format = useFormatter(forecast.timeZone);
    const styles = makeStyles(theme);
    const today = forecast.daily.find(day =>
        format.sameDay(day.date, forecast.current.time),
    );
    const outdated =
        content.outdatedByMs !== undefined
            ? updatedAgo(content.outdatedByMs)
            : undefined;

    return (
        <ScrollView
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl
                    refreshing={content.refreshing}
                    onRefresh={onRefresh}
                />
            }
            testID="home.forecast"
        >
            {outdated ? (
                <Text
                    accessibilityLiveRegion="polite"
                    style={styles.warning}
                    testID="home.outdated"
                >
                    {'⚠️ ' + t(outdated.key, { count: outdated.count })}
                </Text>
            ) : null}

            <CurrentConditions
                forecast={forecast}
                settings={settings}
                format={format}
            />

            {today &&
            today.sunrise !== undefined &&
            today.sunset !== undefined ? (
                <Text style={styles.secondaryCentered} testID="home.sun">
                    {'🌅 ' +
                        t('home.sunriseSunset', {
                            sunrise: format.hour(today.sunrise),
                            sunset: format.hour(today.sunset),
                        })}
                </Text>
            ) : null}

            <Text accessibilityRole="header" style={styles.section}>
                {t('home.next24Hours')}
            </Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                testID="home.hourly"
            >
                {forecast.hourly.map((hour, index) => (
                    <HourCell
                        key={hour.time}
                        hour={hour}
                        label={
                            index === 0 ? t('home.now') : format.hour(hour.time)
                        }
                        settings={settings}
                        format={format}
                    />
                ))}
            </ScrollView>

            <Text accessibilityRole="header" style={styles.section}>
                {t('home.next7Days')}
            </Text>
            <View testID="home.daily">
                {forecast.daily.map(day => (
                    <DayRow
                        key={day.date}
                        day={day}
                        label={
                            day === today
                                ? t('home.today')
                                : format.dayName(day.date)
                        }
                        range={weekRange(forecast.daily)}
                        settings={settings}
                        format={format}
                    />
                ))}
            </View>

            <Text style={styles.attribution}>{t('home.attribution')}</Text>
        </ScrollView>
    );
}

function CurrentConditions({
    forecast,
    settings,
    format,
}: {
    forecast: Forecast;
    settings: UserSettings;
    format: WeatherFormatter;
}): React.JSX.Element {
    const theme = useTheme();
    const { t } = useLocalization();
    const styles = makeStyles(theme);
    const { current } = forecast;
    const condition = t(conditionLabelKey(current.condition));
    const temperature = format.temperature(
        current.temperature,
        settings.temperatureUnit,
    );
    return (
        <View
            accessible
            accessibilityLabel={`${temperature}, ${condition}`}
            style={styles.current}
            testID="home.current"
        >
            <Text importantForAccessibility="no" style={styles.bigIcon}>
                {conditionIcon(current.condition, current.isDay)}
            </Text>
            <Text style={styles.temperature}>{temperature}</Text>
            <Text style={styles.condition}>{condition}</Text>
            <Text style={styles.secondaryCentered}>
                {t('home.feelsLike', {
                    value: format.temperature(
                        current.feelsLike,
                        settings.temperatureUnit,
                    ),
                }) +
                    ' · ' +
                    t('home.humidity', {
                        value: format.percentage(current.humidityPercent),
                    })}
            </Text>
            <Text style={styles.secondaryCentered}>
                {t('home.wind', {
                    value: format.windSpeed(
                        current.windSpeed,
                        settings.windSpeedUnit,
                    ),
                })}
            </Text>
        </View>
    );
}

function HourCell({
    hour,
    label,
    settings,
    format,
}: {
    hour: HourlyForecast;
    label: string;
    settings: UserSettings;
    format: WeatherFormatter;
}): React.JSX.Element {
    const theme = useTheme();
    const { t } = useLocalization();
    const styles = makeStyles(theme);
    const temperature = format.temperature(
        hour.temperature,
        settings.temperatureUnit,
    );
    // 0% is noise: the chance is shown only when there is one (US-02).
    const chance =
        hour.precipitationChancePercent !== undefined &&
        hour.precipitationChancePercent > 0
            ? format.percentage(hour.precipitationChancePercent)
            : undefined;
    const spoken = [label, temperature, t(conditionLabelKey(hour.condition))];
    if (chance) {
        spoken.push(t('home.precipitationChance', { value: chance }));
    }
    return (
        <View
            accessible
            accessibilityLabel={spoken.join(', ')}
            style={styles.hour}
        >
            <Text style={styles.secondary}>{label}</Text>
            <Text importantForAccessibility="no" style={styles.icon}>
                {conditionIcon(hour.condition)}
            </Text>
            <Text style={styles.body}>{temperature}</Text>
            <Text style={styles.chance}>{chance ?? ' '}</Text>
        </View>
    );
}

/** The coldest and warmest temperatures of the week: the scale of every day's bar. */
function weekRange(days: readonly DailyForecast[]): {
    min: number;
    max: number;
} {
    const min = Math.min(...days.map(day => day.minTemperature.celsius));
    const max = Math.max(...days.map(day => day.maxTemperature.celsius));
    return { min, max: max > min ? max : min + 1 };
}

function DayRow({
    day,
    label,
    range,
    settings,
    format,
}: {
    day: DailyForecast;
    label: string;
    range: { min: number; max: number };
    settings: UserSettings;
    format: WeatherFormatter;
}): React.JSX.Element {
    const theme = useTheme();
    const { t } = useLocalization();
    const styles = makeStyles(theme);
    const low = format.temperature(
        day.minTemperature,
        settings.temperatureUnit,
    );
    const high = format.temperature(
        day.maxTemperature,
        settings.temperatureUnit,
    );
    const span = range.max - range.min;
    // `start` and `width` in percent: the bar runs from low to high, and mirrors in Arabic.
    const barStart = ((day.minTemperature.celsius - range.min) / span) * 100;
    const barWidth = Math.max(
        ((day.maxTemperature.celsius - day.minTemperature.celsius) / span) *
            100,
        4,
    );
    return (
        <View
            accessible
            accessibilityLabel={`${label}, ${t(
                conditionLabelKey(day.condition),
            )}, ${t('home.lowHigh', { low, high })}`}
            style={styles.day}
        >
            <Text style={[styles.body, styles.dayName]} numberOfLines={1}>
                {label}
            </Text>
            <Text importantForAccessibility="no" style={styles.icon}>
                {conditionIcon(day.condition)}
            </Text>
            <Text style={[styles.secondary, styles.dayTemperature]}>{low}</Text>
            <View style={styles.track}>
                <View
                    style={[
                        styles.bar,
                        { start: `${barStart}%`, width: `${barWidth}%` },
                    ]}
                />
            </View>
            <Text style={[styles.body, styles.dayTemperature]}>{high}</Text>
        </View>
    );
}

/** The loading state keeps the layout of the content, so nothing jumps when data arrives. */
function HomeSkeleton(): React.JSX.Element {
    const theme = useTheme();
    const { t } = useLocalization();
    const block = (height: number, width: `${number}%`) => (
        <View
            style={[
                skeletonStyles.block,
                {
                    height,
                    width,
                    borderRadius: theme.radius.m,
                    backgroundColor: theme.colors.skeleton,
                    marginBottom: theme.spacing.m,
                },
            ]}
        />
    );
    return (
        <View
            accessible
            accessibilityLabel={t('home.loading')}
            accessibilityState={{ busy: true }}
            style={{ padding: theme.spacing.l }}
            testID="home.loading"
        >
            {block(72, '30%')}
            {block(96, '40%')}
            {block(20, '60%')}
            {block(120, '100%')}
            {block(240, '100%')}
        </View>
    );
}

const skeletonStyles = StyleSheet.create({ block: { alignSelf: 'center' } });

function makeStyles(theme: Theme) {
    const { colors, spacing, fontSize, radius } = theme;
    return StyleSheet.create({
        content: { padding: spacing.m, paddingBottom: spacing.xl },
        warning: {
            backgroundColor: colors.warningBackground,
            color: colors.warningText,
            borderRadius: radius.s,
            padding: spacing.s,
            marginBottom: spacing.m,
            fontSize: fontSize.caption,
            textAlign: 'center',
        },
        current: { alignItems: 'center', marginBottom: spacing.m },
        bigIcon: { fontSize: 64 },
        temperature: {
            color: colors.text,
            fontSize: fontSize.display,
            fontWeight: '200',
        },
        condition: {
            color: colors.text,
            fontSize: fontSize.title,
            marginBottom: spacing.s,
        },
        secondaryCentered: {
            color: colors.secondaryText,
            fontSize: fontSize.body,
            textAlign: 'center',
            marginTop: spacing.xs,
        },
        section: {
            color: colors.text,
            fontSize: fontSize.title,
            fontWeight: '600',
            marginTop: spacing.l,
            marginBottom: spacing.s,
            textAlign: 'auto',
        },
        hour: {
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: radius.m,
            paddingVertical: spacing.s,
            paddingHorizontal: spacing.m,
            marginEnd: spacing.s,
            minWidth: 64,
        },
        icon: { fontSize: fontSize.title, marginVertical: spacing.xs },
        body: { color: colors.text, fontSize: fontSize.body },
        secondary: { color: colors.secondaryText, fontSize: fontSize.body },
        chance: { color: colors.accent, fontSize: fontSize.caption },
        day: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.s,
            minHeight: theme.minTouchTarget,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.separator,
        },
        dayName: { flex: 1 },
        dayTemperature: { minWidth: 40, textAlign: 'center' },
        track: {
            flex: 1,
            height: 6,
            borderRadius: 3,
            backgroundColor: colors.skeleton,
        },
        bar: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            borderRadius: 3,
            backgroundColor: colors.accent,
        },
        attribution: {
            color: colors.secondaryText,
            fontSize: fontSize.caption,
            textAlign: 'center',
            marginTop: spacing.l,
        },
    });
}
