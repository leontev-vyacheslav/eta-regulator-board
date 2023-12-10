import {
    AboutIcon,
    ExitIcon,
    HomeIcon,
    SettingsIcon,
    CircuitIcon,
    RtcClockIcon,
    DebugIcon,
} from './app-icons';
import { IconBaseProps } from 'react-icons/lib/cjs/iconBase';
import { TreeViewItemModel } from '../models/tree-view-item';

export const sideNavigationMenuItems: TreeViewItemModel[] = [
    {
        id: 'home',
        text: 'Главная',
        iconRender: (props: IconBaseProps) => <HomeIcon size={ 22 } { ...props } />,
        path: '/',
        restricted: false,
    },
    {
        id: 'settings',
        text: 'Настройки',
        iconRender: (props: IconBaseProps) => <SettingsIcon size={ 22 } { ...props } />,
        restricted: false,
        items: [
            {
                id: 'heating-circuit-1',
                text: 'Контур 1',
                iconRender: (props: IconBaseProps) => <CircuitIcon size={ 22 } { ...props } />,
                path: '/settings/0',
                restricted: false,
            },
            {
                id: 'heating-circuit-2',
                text: 'Контур 2',
                iconRender: (props: IconBaseProps) => <CircuitIcon size={ 22 } { ...props } />,
                path: '/settings/1',
                restricted: false,
            }
        ]
    },
    {
        id: 'debug',
        text: 'Отладка',
        iconRender: (props: IconBaseProps) => <DebugIcon size={ 22 } { ...props } />,
        path: '/debug',
        restricted: false,
    },
    {
        id: 'rtc-clock',
        text: 'Часы RTC',
        iconRender: (props: IconBaseProps) => <RtcClockIcon size={ 22 } { ...props } />,
        command: 'workDate',
        restricted: false
    },
    {
        id: 'about',
        text: 'О программе',
        iconRender: (props: IconBaseProps) => <AboutIcon size={ 22 } { ...props } />,
        path: '/about',
        restricted: false,
    },
    {
        id: 'exit',
        text: 'Выход',
        iconRender: (props: IconBaseProps) => <ExitIcon size={ 22 } { ...props } />,
        command: 'exit',
        restricted: false
    },
];
