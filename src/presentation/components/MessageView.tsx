import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Button } from './Button';

/** A full-screen message with up to two ways forward: errors, empty states, "where are you?". */
export function MessageView({
    icon,
    title,
    message,
    action,
    secondaryAction,
}: {
    icon?: string;
    title?: string;
    message: string;
    action?: { title: string; onPress: () => void };
    secondaryAction?: { title: string; onPress: () => void };
}): React.JSX.Element {
    const theme = useTheme();
    return (
        <View
            accessibilityLiveRegion="polite"
            style={[styles.container, { padding: theme.spacing.xl }]}
        >
            {icon ? (
                <Text importantForAccessibility="no" style={styles.icon}>
                    {icon}
                </Text>
            ) : null}
            {title ? (
                <Text
                    accessibilityRole="header"
                    style={[
                        styles.center,
                        {
                            color: theme.colors.text,
                            fontSize: theme.fontSize.headline,
                        },
                    ]}
                >
                    {title}
                </Text>
            ) : null}
            <Text
                style={[
                    styles.center,
                    {
                        color: theme.colors.secondaryText,
                        fontSize: theme.fontSize.body,
                        marginVertical: theme.spacing.m,
                    },
                ]}
            >
                {message}
            </Text>
            {action ? (
                <Button
                    filled
                    title={action.title}
                    onPress={action.onPress}
                    testID="message.action"
                />
            ) : null}
            {secondaryAction ? (
                <Button
                    title={secondaryAction.title}
                    onPress={secondaryAction.onPress}
                    testID="message.secondaryAction"
                />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    icon: { fontSize: 56 },
    center: { textAlign: 'center' },
});
