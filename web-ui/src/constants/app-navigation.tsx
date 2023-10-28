import {
    AboutIcon,
    ExitIcon,
    HomeIcon,

    SettingsIcon,
    CircuitIcon,
    ManualModeIcon,
    RtcClockIcon,
} from './app-icons';
import { IconBaseProps } from 'react-icons/lib/cjs/iconBase';
import { TreeViewItemModel } from '../models/tree-view-item';

export const navigation: TreeViewItemModel[] = [
    {
        text: 'Главная',
        iconRender: (props: IconBaseProps) => <HomeIcon size={ 22 } { ...props } />,
        path: '/',
        restricted: false,
    },
    {
        text: 'Настройки',
        iconRender: (props: IconBaseProps) => <SettingsIcon size={ 22 } { ...props } />,
        // path: '/settings',
        restricted: false,
        items: [
            {
                text: 'Контур 1',
                iconRender: (props: IconBaseProps) => <CircuitIcon size={ 22 } { ...props } />,
                path: '/settings/0',
                restricted: false,
            },
            {
                text: 'Контур 2',
                iconRender: (props: IconBaseProps) => <CircuitIcon size={ 22 } { ...props } />,
                path: '/settings/1',
                restricted: false,
            }
        ]
    },
    {
        text: 'Ручной режим',
        iconRender: (props: IconBaseProps) => <ManualModeIcon size={ 22 } { ...props } />,
        path: '/debug',
        restricted: false,
    },
    {
        text: 'Часы RTC',
        iconRender: (props: IconBaseProps) => <RtcClockIcon size={ 22 } { ...props } />,
        command: 'workDate',
        restricted: false
    },
    {
        text: 'О программе',
        iconRender: (props: IconBaseProps) => <AboutIcon size={ 22 } { ...props } />,
        path: '/about',
        restricted: false,
    },
    {
        text: 'Выход',
        iconRender: (props: IconBaseProps) => <ExitIcon size={ 22 } { ...props } />,
        command: 'exit',
        restricted: false
    },
];
