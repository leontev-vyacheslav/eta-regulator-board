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
import { TreeViewItemModel } from '../models/tree-view-item';
import { HeatingCircuitIndexModel } from '../models/regulator-settings/enums/heating-circuit-type-model';
import { useAuth } from '../contexts/auth';
import { HeatingCircuitIconSelector } from '../components/heating-circuit-icon-selector/heating-circuit-icon-selector';
import { useRegulatorSettings } from '../contexts/app-regulator-settings';
import { IconBaseProps } from 'react-icons';

export const useSideNavigationMenuItems = () => {
    const { regulatorSettings, getHeatingCircuitName } = useRegulatorSettings();
    const { isAdmin, isOperator } = useAuth();

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
                        visible: regulatorSettings
                    },
                    {
                        id: 'heating-circuit-2',
                        text: getHeatingCircuitName(HeatingCircuitIndexModel.second),
                        iconRender: () => <HeatingCircuitIconSelector heatingCircuitIndex={ HeatingCircuitIndexModel.second } />,
                        path: '/settings/1',
                        visible: regulatorSettings
                    }, {
                        id: 'app-settings',
                        text: 'Приложение',
                        iconRender: (props: IconBaseProps) => <AppIcon size={ 22 } { ...props } />,
                        path: '/app-settings',
                        visible: regulatorSettings && isAdmin()
                    }
                ],
                visible: isAdmin() || isOperator()
            },
            {
                id: 'archives',
                text: 'Архивы',
                iconRender: (props: IconBaseProps) => <ArchivesIcon size={ 22 } { ...props } />,
                items: [
                    {
                        id: 'archives-1',
                        text: getHeatingCircuitName(HeatingCircuitIndexModel.first),
                        iconRender: () => <HeatingCircuitIconSelector heatingCircuitIndex={ HeatingCircuitIndexModel.first } />,
                        path: '/archives/0',
                        visible: regulatorSettings
                    },
                    {
                        id: 'archives-2',
                        text: getHeatingCircuitName(HeatingCircuitIndexModel.second),
                        iconRender: () => <HeatingCircuitIconSelector heatingCircuitIndex={ HeatingCircuitIndexModel.second } />,
                        path: '/archives/1',
                        visible: regulatorSettings
                    }
                ],
                visible: isAdmin() || isOperator()
            },
            {
                id: 'manual',
                text: 'Ручной режим',
                iconRender: (props: IconBaseProps) => <ManualModeIcon size={ 22 } { ...props } />,
                path: '/debug/1',
                visible: isAdmin()
            },
            {
                id: 'debug',
                text: 'Отладка',
                iconRender: (props: IconBaseProps) => <DebugIcon size={ 22 } { ...props } />,
                path: '/debug/2',
                visible: isAdmin() && regulatorSettings?.service.allowDebugMode
            },
            {
                id: 'rtc-clock',
                text: 'Часы RTC',
                iconRender: (props: IconBaseProps) => <RtcClockIcon size={ 22 } { ...props } />,
                command: 'workDate',
                visible: isAdmin() || isOperator()
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
    }, [getHeatingCircuitName, isAdmin, isOperator, regulatorSettings]);
};
