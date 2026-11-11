import React from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import type { City } from '../../domain';
import { Button, IconButton } from '../components/Button';
import { MessageView } from '../components/MessageView';
import { Screen } from '../components/Screen';
import { errorMessageKey } from '../errorMessage';
import { useFormatter, useLocalization } from '../i18n/useLocalization';
import { useTheme } from '../theme/ThemeContext';
import type { Theme } from '../theme/theme';
import { conditionIcon, conditionLabelKey } from '../weather/conditionUi';
import {
    placeId,
    type CitiesActions,
    type CitiesState,
    type PlaceItem,
} from './citiesState';

/** Cities (US-04, US-05): search, saved places, remove with Undo. Props only. */
export function CitiesView({
    state,
    actions,
}: {
    state: CitiesState;
    actions: CitiesActions;
}): React.JSX.Element {
    const theme = useTheme();
    const { t } = useLocalization();
    const styles = makeStyles(theme);
    return (
        <Screen title={t('cities.title')} onBack={actions.onBack}>
            <View style={styles.searchRow}>
                <TextInput
                    accessibilityLabel={t('cities.searchPrompt')}
                    autoCorrect={false}
                    onChangeText={actions.onQueryChange}
                    placeholder={t('cities.searchPrompt')}
                    placeholderTextColor={theme.colors.secondaryText}
                    returnKeyType="search"
                    style={styles.search}
                    testID="cities.search"
                    value={state.query}
                />
                {state.query ? (
                    <IconButton
                        icon="✕"
                        label={t('action.clearSearch')}
                        onPress={() => actions.onQueryChange('')}
                    />
                ) : null}
            </View>
            {state.search.kind === 'idle' ? (
                <PlaceList state={state} actions={actions} />
            ) : (
                <SearchArea state={state} actions={actions} />
            )}
            {state.notice ? <Notice state={state} actions={actions} /> : null}
        </Screen>
    );
}

function SearchArea({
    state,
    actions,
}: {
    state: CitiesState;
    actions: CitiesActions;
}): React.JSX.Element {
    const theme = useTheme();
    const { t } = useLocalization();
    const styles = makeStyles(theme);
    const { search } = state;
    switch (search.kind) {
        case 'idle':
        case 'searching':
            return (
                <View
                    accessibilityState={{ busy: true }}
                    style={styles.padded}
                    testID="cities.searching"
                >
                    {[0, 1, 2].map(i => (
                        <View key={i} style={styles.skeletonRow} />
                    ))}
                </View>
            );
        case 'noResults':
            return <MessageView icon="🔍" message={t('cities.noResults')} />;
        case 'failed': {
            const key = errorMessageKey(search.error);
            return key ? (
                <MessageView
                    message={t(key)}
                    action={{
                        title: t('action.retry'),
                        onPress: actions.onRetrySearch,
                    }}
                />
            ) : (
                <View />
            );
        }
        case 'results':
            return (
                <FlatList
                    data={search.cities}
                    keyExtractor={city => String(city.id)}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item }) => (
                        <ResultRow city={item} onAdd={actions.onAdd} />
                    )}
                    testID="cities.results"
                />
            );
    }
}

/** "İstanbul · Türkiye": the region and country tell two cities with the same name apart. */
function cityDetail(city: City): string | undefined {
    const parts = [city.region, city.country].filter(
        part => part && part !== city.name,
    );
    return parts.length > 0 ? parts.join(' · ') : undefined;
}

function ResultRow({
    city,
    onAdd,
}: {
    city: City;
    onAdd: (city: City) => void;
}): React.JSX.Element {
    const theme = useTheme();
    const { t } = useLocalization();
    const styles = makeStyles(theme);
    const detail = cityDetail(city);
    return (
        <Pressable
            accessibilityLabel={t('cities.add', { name: city.name })}
            accessibilityRole="button"
            onPress={() => onAdd(city)}
            style={styles.row}
            testID={`cities.add.${city.id}`}
        >
            <View style={styles.rowText}>
                <Text style={styles.name}>{city.name}</Text>
                {detail ? <Text style={styles.detail}>{detail}</Text> : null}
            </View>
            <Text importantForAccessibility="no" style={styles.add}>
                ＋
            </Text>
        </Pressable>
    );
}

function PlaceList({
    state,
    actions,
}: {
    state: CitiesState;
    actions: CitiesActions;
}): React.JSX.Element {
    const theme = useTheme();
    const { t } = useLocalization();
    const styles = makeStyles(theme);
    const hasSaved = state.places.some(item => item.place.kind === 'saved');
    return (
        <FlatList
            data={state.places}
            keyExtractor={item => placeId(item.place)}
            ListFooterComponent={
                hasSaved ? undefined : (
                    <Text style={styles.empty}>{t('cities.emptySaved')}</Text>
                )
            }
            renderItem={({ item }) => (
                <PlaceRow item={item} state={state} actions={actions} />
            )}
            testID="cities.places"
        />
    );
}

function PlaceRow({
    item,
    state,
    actions,
}: {
    item: PlaceItem;
    state: CitiesState;
    actions: CitiesActions;
}): React.JSX.Element {
    const theme = useTheme();
    const { t } = useLocalization();
    const styles = makeStyles(theme);
    // The list shows "now" values only, so any time zone gives the same text.
    const format = useFormatter('UTC');
    const { place } = item;
    const name =
        place.kind === 'saved' ? place.city.name : t('home.currentLocation');
    const temperature = item.temperature
        ? format.temperature(item.temperature, state.temperatureUnit)
        : undefined;
    const spoken = [
        name,
        temperature,
        item.condition && t(conditionLabelKey(item.condition)),
    ]
        .filter(Boolean)
        .join(', ');
    return (
        <View style={styles.row}>
            <Pressable
                accessibilityLabel={spoken}
                accessibilityRole="button"
                onPress={() => actions.onSelect(place)}
                style={styles.placeButton}
                testID={`cities.place.${placeId(place)}`}
            >
                <Text style={[styles.name, styles.rowText]} numberOfLines={1}>
                    {place.kind === 'currentLocation' ? `📍 ${name}` : name}
                </Text>
                {temperature ? (
                    <Text style={styles.name}>{temperature}</Text>
                ) : null}
                {item.condition ? (
                    <Text importantForAccessibility="no" style={styles.icon}>
                        {conditionIcon(item.condition)}
                    </Text>
                ) : null}
            </Pressable>
            {/* The current location is always first and cannot be removed (US-05). */}
            {place.kind === 'saved' ? (
                <IconButton
                    icon="🗑"
                    label={t('cities.remove', { name: place.city.name })}
                    onPress={() => actions.onRemove(place.city)}
                    testID={`cities.remove.${place.city.id}`}
                />
            ) : null}
        </View>
    );
}

function Notice({
    state,
    actions,
}: {
    state: CitiesState;
    actions: CitiesActions;
}): React.JSX.Element | null {
    const theme = useTheme();
    const { t } = useLocalization();
    const styles = makeStyles(theme);
    const { notice } = state;
    if (!notice) {
        return null;
    }
    const removed = notice.kind === 'removed';
    return (
        <View
            accessibilityLiveRegion="polite"
            style={styles.notice}
            testID="cities.notice"
        >
            <Text style={styles.noticeText}>
                {removed
                    ? t('cities.removed', { name: notice.city.name })
                    : t('cities.alreadySaved', { name: notice.city.name })}
            </Text>
            {removed ? (
                <Button
                    title={t('cities.undo')}
                    onPress={actions.onUndo}
                    testID="cities.undo"
                />
            ) : null}
        </View>
    );
}

function makeStyles(theme: Theme) {
    const { colors, spacing, fontSize, radius } = theme;
    return StyleSheet.create({
        searchRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: spacing.m,
            marginBottom: spacing.s,
            borderRadius: radius.m,
            backgroundColor: colors.surface,
            paddingHorizontal: spacing.m,
        },
        search: {
            flex: 1,
            minHeight: theme.minTouchTarget,
            color: colors.text,
            fontSize: fontSize.body,
            textAlign: 'auto',
            writingDirection: 'auto',
        },
        padded: { padding: spacing.m },
        skeletonRow: {
            height: 48,
            borderRadius: radius.s,
            backgroundColor: colors.skeleton,
            marginBottom: spacing.s,
        },
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 56,
            paddingHorizontal: spacing.m,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.separator,
        },
        placeButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.s,
            minHeight: theme.minTouchTarget,
        },
        rowText: { flex: 1 },
        name: { color: colors.text, fontSize: fontSize.body },
        detail: { color: colors.secondaryText, fontSize: fontSize.caption },
        add: { color: colors.accent, fontSize: fontSize.title },
        icon: { fontSize: fontSize.title },
        empty: {
            color: colors.secondaryText,
            fontSize: fontSize.body,
            padding: spacing.l,
            textAlign: 'center',
        },
        notice: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            margin: spacing.m,
            paddingStart: spacing.m,
            borderRadius: radius.m,
            backgroundColor: colors.surface,
        },
        noticeText: { flex: 1, color: colors.text, fontSize: fontSize.body },
    });
}
