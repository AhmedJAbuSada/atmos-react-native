import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../src/app/App';

test('the app renders', async () => {
    await ReactTestRenderer.act(() => {
        ReactTestRenderer.create(<App />);
    });
});
