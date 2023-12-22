import 'devextreme/dist/css/dx.common.css';
import './themes/generated/theme.base.css';
import './themes/generated/theme.additional.css';
import './dx-styles.scss';

import { HashRouter as BrowserRouter } from 'react-router-dom';
import { NavigationProvider } from './contexts/navigation';
import { AuthProvider, useAuth } from './contexts/auth';
import { useScreenSizeClass } from './utils/media-query';
import { AppSettingsProvider } from './contexts/app-settings';
import { AppDataProvider } from './contexts/app-data/app-data';
import { SharedAreaProvider } from './contexts/shared-area';
import ruMessages from 'devextreme/localization/messages/ru.json';
import { locale, loadMessages } from 'devextreme/localization';
import ContentAuth from './content-auth';
import ContentNonAuth from './content-non-auth';
import { WorkdatePickerProvider } from './contexts/workdate-context';
import Loader from './components/loader/loader';


function App() {
    const { user } = useAuth();

    if (user === undefined) {
        return null;
    }

    loadMessages(ruMessages);
    loadMessages({
        'ru': {
            'validation-compare-supply-temperature-return-temperature': 'Значение Тп всегда больше Тo',
            'validation-value-already-existed': 'Значение уже существует',
            'validation-range-formatted-with-values': 'Допустумые значения в диапазоне от {0} до {1}',
            'validation-range-overlapped': 'Перекрытие диапазонов',
            'confirm-dialog-delete-all-schedules': 'Вы действительно хотите удалить все дни?',
            'confirm-dialog-delete-all-schedule-windows': 'Вы действительно хотите удалить все окна?',
            'confirm-dialog-delete-all-points': 'Вы действительно хотите удалить все точки?',
            'confirm-dialog-reset-heating-circuit-settings': 'Вы действительно хотите сбросить настройки текущего контура?',
            'confirm-dialog-se-default-heating-circuit-settings': 'Применить настройки по-умолчанию в соответствии с типом контура?',
            'menu-item-delete-all-schedules': 'Удалить все дни...',
            'menu-item-delete-all-schedule-windows': 'Удалить все окна...',
            'menu-item-delete-all-points': 'Удалить все точки...',
            'menu-item-add-schedule-window': 'Добавить окно...',
            'menu-item-add-point': 'Добавить точку...',
            'confirm-title': 'Подтвердить',
            'temperature-graph-title': 'Температурный график',
            'schedule-windows-title': 'Временные окна',
            'schedules-title': 'Дни недели',
            'dxDataGrid-noDataText': 'Нет данных для отображения'
        }
    });
    locale('ru-RU');

    return user === null ? <ContentNonAuth/> :  <ContentAuth />
}

function Main() {
    const screenSizeClass = useScreenSizeClass();
    return (
        <BrowserRouter>
            <AuthProvider>
                <SharedAreaProvider>
                    <AppDataProvider>
                        <AppSettingsProvider>
                            <WorkdatePickerProvider>
                                <NavigationProvider>
                                    <div className={ `app ${screenSizeClass}` }>
                                        <App />
                                        <Loader />
                                    </div>
                                </NavigationProvider>
                            </WorkdatePickerProvider>
                        </AppSettingsProvider>
                    </AppDataProvider>
                </SharedAreaProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default Main;
