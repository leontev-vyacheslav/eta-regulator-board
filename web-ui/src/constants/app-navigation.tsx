import {
    AboutIcon,
    ExitIcon,
    HomeIcon,
    DebugIcon,
    SettingsIcon
} from './app-icons';
import { IconBaseProps } from 'react-icons/lib/cjs/iconBase';
import { TreeViewItemModel } from '../models/tree-view-item';

export const navigation: TreeViewItemModel[] = [
    {
        text: 'Главная',
        iconRender: (props: IconBaseProps) => <HomeIcon size={ 22 } { ...props } />,
        path: '/home',
        restricted: false,
    },
    {
        text: 'Настройки',
        iconRender: (props: IconBaseProps) => <SettingsIcon size={ 22 } { ...props } />,
        path: '/settings',
        restricted: false,
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
    {
        text: 'Отладка',
        iconRender: (props: IconBaseProps) => <DebugIcon size={ 22 } { ...props } />,
        path: '/debug',
        restricted: false,
    },
];
