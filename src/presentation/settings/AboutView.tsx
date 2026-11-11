import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { useLocalization } from '../i18n/useLocalization';
import { useTheme } from '../theme/ThemeContext';

export interface AboutActions {
    readonly onOpenDataSource: () => void;
    readonly onOpenSourceCode: () => void;
    readonly onBack: () => void;
}

/** About (US-10): version, attribution (Open-Meteo's licence asks for it), source, licence. */
export function AboutView({
    version,
    actions,
}: {
    version: string;
    actions: AboutActions;
}): React.JSX.Element {
    const theme = useTheme();
    const { t } = useLocalization();
    return (
        <Screen title={t('about.title')} onBack={actions.onBack}>
            <View
                style={[
                    styles.content,
                    { padding: theme.spacing.l, gap: theme.spacing.s },
                ]}
            >
                {/* The brand name is not translated. */}
                <Text
                    style={[
                        styles.brand,
                        {
                            color: theme.colors.text,
                            fontSize: theme.fontSize.headline,
                        },
                    ]}
                >
                    Atmos
                </Text>
                <Text
                    style={{
                        color: theme.colors.secondaryText,
                        fontSize: theme.fontSize.body,
                    }}
                    testID="about.version"
                >
                    {t('about.version', { version })}
                </Text>
                <Button
                    title={`${t('about.dataSource')} ↗`}
                    onPress={actions.onOpenDataSource}
                    testID="about.dataSource"
                />
                <Button
                    title={`${t('about.sourceCode')} ↗`}
                    onPress={actions.onOpenSourceCode}
                    testID="about.sourceCode"
                />
                <Text
                    style={{
                        color: theme.colors.secondaryText,
                        fontSize: theme.fontSize.body,
                    }}
                >
                    {t('about.license')}
                </Text>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    content: { alignItems: 'center' },
    brand: { fontWeight: '600' },
});
