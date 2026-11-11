/**
 * ESLint enforces what the compiler cannot: the Clean Architecture dependency rule
 * (ADR-0001) and the locale-safe casing rule (ADR-0005). CI runs it with --max-warnings 0,
 * so a violation fails the build like a compile error would.
 */
module.exports = {
    root: true,
    extends: ['@react-native'],
    plugins: ['boundaries'],
    settings: {
        'import/resolver': { typescript: true, node: true },
        // The layers, by folder.
        'boundaries/elements': [
            { type: 'domain', pattern: 'src/domain' },
            { type: 'data', pattern: 'src/data' },
            { type: 'presentation', pattern: 'src/presentation' },
            { type: 'app', pattern: 'src/app' },
        ],
    },
    rules: {
        // Dependencies point inwards:  presentation ─┐
        //                                            ├─▶ domain
        //                              data ─────────┘
        // and only app (the composition root) sees everything.
        'boundaries/dependencies': [
            'error',
            {
                default: 'disallow',
                policies: [
                    {
                        from: { element: { type: 'domain' } },
                        allow: { to: { element: { types: ['domain'] } } },
                    },
                    {
                        from: { element: { type: 'data' } },
                        allow: {
                            to: { element: { types: ['domain', 'data'] } },
                        },
                    },
                    {
                        from: { element: { type: 'presentation' } },
                        allow: {
                            to: {
                                element: { types: ['domain', 'presentation'] },
                            },
                        },
                    },
                    {
                        from: { element: { type: 'app' } },
                        allow: {
                            to: {
                                element: {
                                    types: [
                                        'domain',
                                        'data',
                                        'presentation',
                                        'app',
                                    ],
                                },
                            },
                        },
                    },
                ],
            },
        ],
        // "istanbul".toUpperCase() gives "ISTANBUL"; Turkish readers expect "İSTANBUL".
        'no-restricted-syntax': [
            'error',
            {
                selector:
                    'CallExpression[callee.property.name=/^to(Upper|Lower)Case$/]',
                message:
                    'Pass a locale: toLocaleUpperCase(locale) / toLocaleLowerCase(locale). See ADR-0005.',
            },
            // A style that says "left" stays on the left in Arabic. "start" follows the reading
            // direction (NF-02, AGENTS.md).
            {
                selector:
                    'Property[key.name=/^(left|right|(margin|padding)(Left|Right)|border(Left|Right)(Width|Color)|border(Top|Bottom)(Left|Right)Radius)$/]',
                message:
                    'Use start/end (marginStart, paddingEnd, start, ...) so the layout mirrors in right-to-left languages.',
            },
            {
                selector: "Property[key.name='textAlign'][value.value=/^(left|right)$/]",
                message: "Use textAlign 'auto' so text follows the reading direction.",
            },
        ],
    },
    overrides: [
        {
            // The domain is plain TypeScript: React and React Native are packages, not layers,
            // so the boundaries rule does not see them. This closes that gap (ADR-0001).
            files: ['src/domain/**'],
            rules: {
                'no-restricted-imports': [
                    'error',
                    {
                        patterns: [
                            {
                                group: [
                                    'react',
                                    'react-native',
                                    'react-native-*',
                                    '@react-native*',
                                    '@react-navigation/*',
                                ],
                                message:
                                    'src/domain imports nothing from React or React Native. See ADR-0001.',
                            },
                        ],
                    },
                ],
            },
        },
    ],
};
