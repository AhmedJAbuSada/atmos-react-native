import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HelloScreen } from '../presentation/HelloScreen';

/** The app's root component. Navigation and the dependency context arrive in step 06. */
export default function App(): React.JSX.Element {
    return (
        <SafeAreaProvider>
            <HelloScreen />
        </SafeAreaProvider>
    );
}
