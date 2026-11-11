import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * A placeholder screen for step 02, proving the app, the layers and the tooling work
 * together. Real screens arrive in step 05. "Atmos" is the brand name, not a translated text.
 */
export function HelloScreen(): React.JSX.Element {
    return (
        <View style={styles.container}>
            <Text accessibilityRole="header" style={styles.title}>
                Atmos
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 34, fontWeight: '600' },
});
