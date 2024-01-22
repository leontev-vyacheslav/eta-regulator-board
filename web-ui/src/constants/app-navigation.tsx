import { useMemo } from 'react';
import {
    AboutIcon,
    ExitIcon,
    HomeIcon,
    SettingsIcon,
    RtcClockIcon,
    DebugIcon,
    ManualModeIcon,
    AppIcon,
    ArchivesIcon,
} from './app-icons';
import { IconBaseProps } from 'react-icons/lib/cjs/iconBase';
import { TreeViewItemModel } from '../models/tree-view-item';
import { HeatingCircuitIndexModel } from '../models/regulator-settings/enums/heating-circuit-type-model';
import { useAuth } from '../contexts/auth';
import { UserRoleModel } from '../models/enums/user-role-model';
import { HeatingCircuitIconSelector } from '../components/heating-circuit-icon-selector/heating-circuit-icon-selector';
import { useRegulatorSettings } from '../contexts/app-regulator-settings';

export const useSideNavigationMenuItems = () => {
    const { regulatorSettings, getHeatingCircuitName } = useRegulatorSettings();
    const { user } = useAuth();

    return useMemo<TreeViewItemModel[]>(() => {
        return [
            {
                id: 'home',
                text: 'Главная',
                iconRender: (props: IconBaseProps) => <HomeIcon size={ 22 } { ...props } />,
                path: '/',
            },
            {
                id: 'settings',
                text: 'Настройки',
                iconRender: (props: IconBaseProps) => <SettingsIcon size={ 22 } { ...props } />,
                items: [
                    {
                        id: 'heating-circuit-1',
                        text: getHeatingCircuitName(HeatingCircuitIndexModel.first),
                        iconRender: () => <HeatingCircuitIconSelector heatingCircuitIndex={ HeatingCircuitIndexModel.first } />,
                        path: '/settings/0',
                    },
                    {
                        id: 'heating-circuit-2',
                        text: getHeatingCircuitName(HeatingCircuitIndexModel.second),
                        iconRender: () => <HeatingCircuitIconSelector heatingCircuitIndex={ HeatingCircuitIndexModel.second } />,
                        path: '/settings/1',
                    }, {
                        id: 'app-settings',
                        text: 'Приложение',
                        iconRender: (props: IconBaseProps) => <AppIcon size={ 22 } { ...props } />,
                        path: '/app-settings',
                        visible: user && (user.role === UserRoleModel.admin)
                    }
                ],
                visible: user && (user.role === UserRoleModel.admin || user.role === UserRoleModel.operator)
            },
            {
                id: 'archives',
                text: 'Архивы',
                iconRender: (props: IconBaseProps) => <ArchivesIcon size={ 22 } { ...props } />,
                path: '/archives',
                visible: user && (user.role === UserRoleModel.admin || user.role === UserRoleModel.operator)
            },
            {
                id: 'manual',
                text: 'Ручной режим',
                iconRender: (props: IconBaseProps) => <ManualModeIcon size={ 22 } { ...props } />,
                path: '/debug/1',
                visible: user && (user.role === UserRoleModel.admin)
            },
            {
                id: 'debug',
                text: 'Отладка',
                iconRender: (props: IconBaseProps) => <DebugIcon size={ 22 } { ...props } />,
                path: '/debug/2',
                visible: user && (user.role === UserRoleModel.admin) && regulatorSettings?.service.allowDebugMode
            },
            {
                id: 'rtc-clock',
                text: 'Часы RTC',
                iconRender: (props: IconBaseProps) => <RtcClockIcon size={ 22 } { ...props } />,
                command: 'workDate',
                visible: user && (user.role === UserRoleModel.admin || user.role === UserRoleModel.operator)
            },
            {
                id: 'about',
                text: 'О программе',
                iconRender: (props: IconBaseProps) => <AboutIcon size={ 22 } { ...props } />,
                path: '/about',
            },
            {
                id: 'exit',
                text: 'Выход',
                iconRender: (props: IconBaseProps) => <ExitIcon size={ 22 } { ...props } />,
                command: 'exit',
            },
        ] as TreeViewItemModel[];
    }, [getHeatingCircuitName, regulatorSettings?.service.allowDebugMode, user]);
};
