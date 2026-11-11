import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalization } from '../i18n/useLocalization';
import { useTheme } from '../theme/ThemeContext';
import { IconButton } from './Button';

/** The frame of every screen: safe area, background and a top bar. */
export function Screen({
    title,
    onBack,
    start,
    end,
    children,
}: {
    title?: string;
    /** Shows a back arrow that points the right way in Arabic. */
    onBack?: () => void;
    start?: React.ReactNode;
    end?: React.ReactNode;
    children: React.ReactNode;
}): React.JSX.Element {
    const theme = useTheme();
    const { t, rtl } = useLocalization();
    return (
        <SafeAreaView
            style={[styles.fill, { backgroundColor: theme.colors.background }]}
        >
            <View style={[styles.bar, { paddingHorizontal: theme.spacing.s }]}>
                <View style={styles.side}>
                    {onBack ? (
                        <IconButton
                            icon="←"
                            label={t('action.back')}
                            mirrored={rtl}
                            onPress={onBack}
                        />
                    ) : (
                        start
                    )}
                </View>
                <Text
                    accessibilityRole="header"
                    numberOfLines={1}
                    style={[
                        styles.title,
                        {
                            color: theme.colors.text,
                            fontSize: theme.fontSize.title,
                        },
                    ]}
                >
                    {title}
                </Text>
                <View style={[styles.side, styles.end]}>{end}</View>
            </View>
            {children}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    fill: { flex: 1 },
    bar: { flexDirection: 'row', alignItems: 'center', minHeight: 56 },
    side: { minWidth: 96, flexDirection: 'row', alignItems: 'center' },
    end: { justifyContent: 'flex-end' },
    title: { flex: 1, textAlign: 'center', fontWeight: '600' },
});
