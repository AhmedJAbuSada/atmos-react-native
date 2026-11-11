import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/**
 * A row of options, one selected. Each option is a radio button for screen readers, so
 * TalkBack and VoiceOver say "°C, selected, 1 of 2".
 */
export function SegmentedControl<T extends string>({
    label,
    options,
    selected,
    onSelect,
    testID,
}: {
    label: string;
    options: readonly { value: T; title: string }[];
    selected: T;
    onSelect: (value: T) => void;
    testID?: string;
}): React.JSX.Element {
    const theme = useTheme();
    return (
        <View
            accessibilityRole="radiogroup"
            accessibilityLabel={label}
            style={styles.row}
            testID={testID}
        >
            {options.map(option => {
                const isSelected = option.value === selected;
                return (
                    <Pressable
                        key={option.value}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: isSelected }}
                        onPress={() => onSelect(option.value)}
                        testID={
                            testID ? `${testID}.${option.value}` : undefined
                        }
                        style={[
                            styles.option,
                            {
                                minHeight: theme.minTouchTarget,
                                borderRadius: theme.radius.s,
                                borderColor: theme.colors.accent,
                                paddingHorizontal: theme.spacing.m,
                            },
                            isSelected && {
                                backgroundColor: theme.colors.accent,
                            },
                        ]}
                    >
                        <Text
                            style={{
                                color: isSelected
                                    ? theme.colors.onAccent
                                    : theme.colors.accent,
                                fontSize: theme.fontSize.body,
                            }}
                        >
                            {option.title}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    option: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
