import React from 'react';
import { render } from '@testing-library/react';
import { AppSettingsProvider } from './contexts/app-settings';
import { AuthProvider } from './contexts/auth';
import { SharedAreaProvider } from './contexts/shared-area';
import { AppDataProvider } from './contexts/app-data';


// eslint-disable-next-line no-undef
test('renders learn react link', () => {

    const component = render(
        <AppSettingsProvider>
            <AuthProvider>
                <SharedAreaProvider>
                    <AppDataProvider/>
                </SharedAreaProvider>
            </AuthProvider>
        </AppSettingsProvider>,
    );


    expect(component).toBeDefined();
});
