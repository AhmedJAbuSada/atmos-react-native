import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/**
 * A text button with a touch target of at least 48 × 48 (NF-03). `filled` is the main action
 * of a screen; the plain style is for secondary actions.
 */
export function Button({
    title,
    onPress,
    filled = false,
    testID,
}: {
    title: string;
    onPress: () => void;
    filled?: boolean;
    testID?: string;
}): React.JSX.Element {
    const theme = useTheme();
    return (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            testID={testID}
            style={({ pressed }) => [
                styles.button,
                {
                    minHeight: theme.minTouchTarget,
                    minWidth: theme.minTouchTarget,
                    borderRadius: theme.radius.m,
                    paddingHorizontal: theme.spacing.m,
                    backgroundColor: filled
                        ? theme.colors.accent
                        : 'transparent',
                    opacity: pressed ? 0.7 : 1,
                },
            ]}
        >
            <Text
                style={[
                    styles.label,
                    {
                        color: filled
                            ? theme.colors.onAccent
                            : theme.colors.accent,
                        fontSize: theme.fontSize.body,
                    },
                ]}
            >
                {title}
            </Text>
        </Pressable>
    );
}

/** An icon-only button: the label is read by screen readers, the glyph is decoration. */
export function IconButton({
    icon,
    label,
    onPress,
    mirrored = false,
    testID,
}: {
    icon: string;
    label: string;
    onPress: () => void;
    /** Arrows point the other way in right-to-left layouts. */
    mirrored?: boolean;
    testID?: string;
}): React.JSX.Element {
    const theme = useTheme();
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            hitSlop={8}
            onPress={onPress}
            testID={testID}
            style={[
                styles.icon,
                {
                    minHeight: theme.minTouchTarget,
                    minWidth: theme.minTouchTarget,
                },
            ]}
        >
            <Text
                importantForAccessibility="no"
                style={[
                    {
                        color: theme.colors.accent,
                        fontSize: theme.fontSize.title,
                    },
                    mirrored && styles.mirrored,
                ]}
            >
                {icon}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: { alignItems: 'center', justifyContent: 'center' },
    label: { fontWeight: '600', textAlign: 'center' },
    icon: { alignItems: 'center', justifyContent: 'center' },
    mirrored: { transform: [{ scaleX: -1 }] },
});
