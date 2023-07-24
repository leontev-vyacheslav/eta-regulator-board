import 'devextreme/dist/css/dx.common.css';
import './themes/generated/theme.base.css';
import './themes/generated/theme.additional.css';
import './dx-styles.scss';

import { BrowserRouter } from 'react-router-dom';
import { NavigationProvider } from './contexts/navigation';
import { AuthProvider } from './contexts/auth';
import { useScreenSizeClass } from './utils/media-query';
import ContentAuth from './content-auth';
import { AppSettingsProvider } from './contexts/app-settings';
import { AppDataProvider } from './contexts/app-data';
import { SharedAreaProvider } from './contexts/shared-area';
import ruMessages from 'devextreme/localization/messages/ru.json';
import { locale, loadMessages } from 'devextreme/localization';
import React from 'react';

function App () {
    // const { user } = useAuth();

    // if (user === undefined) {
    //     return null;
    // }
    loadMessages(ruMessages);
    locale('ru-RU');

    return /*user === null ? <ContentNonAuth/> :*/  <ContentAuth/>
}

function Main () {
    const screenSizeClass = useScreenSizeClass();
    return (
        <BrowserRouter>
            <AppSettingsProvider>
                <AuthProvider>
                    <SharedAreaProvider>
                        <AppDataProvider>
                            <NavigationProvider>
                                <div className={ `app ${ screenSizeClass }` }>
                                    <App/>
                                </div>
                            </NavigationProvider>
                        </AppDataProvider>
                    </SharedAreaProvider>
                </AuthProvider>
            </AppSettingsProvider>
        </BrowserRouter>
    );
}

export default Main;
