import React, { createContext, useContext } from 'react';
import { lightTheme, type Theme } from './theme';

const ThemeContext = createContext<Theme>(lightTheme);

/** Provides the theme to every component below; the app root picks it (step 06). */
export function ThemeProvider({
    theme,
    children,
}: {
    theme: Theme;
    children: React.ReactNode;
}): React.JSX.Element {
    return (
        <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
    );
}

export function useTheme(): Theme {
    return useContext(ThemeContext);
}
