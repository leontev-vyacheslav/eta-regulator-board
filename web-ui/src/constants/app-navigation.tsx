import { useMemo } from 'react';
import {
    AboutIcon,
    ExitIcon,
    HomeIcon,
    SettingsIcon,
    RtcClockIcon,
    DebugIcon,
    ManualModeIcon,
    HeatSysIcon,
    HotWaterIcon,
    VentilationIcon,
    AppSettingsIcon,
} from './app-icons';
import { IconBaseProps } from 'react-icons/lib/cjs/iconBase';
import { TreeViewItemModel } from '../models/tree-view-item';
import { useAppSettings } from '../contexts/app-settings';
import { HeatingCircuitTypeModel } from '../models/regulator-settings/enums/heating-circuit-type-model';

export const useSideNavigationMenuItems = () => {
    const { regulatorSettings } = useAppSettings();

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
                        text: regulatorSettings?.heatingCircuits.items[0].name,
                        iconRender: (props: IconBaseProps) => {
                            return regulatorSettings?.heatingCircuits.items[0].type === HeatingCircuitTypeModel.heating
                                ? <HeatSysIcon size={ 22 } { ...props } />
                                : regulatorSettings?.heatingCircuits.items[0].type === HeatingCircuitTypeModel.hotWater
                                    ? <HotWaterIcon size={ 22 } { ...props } />
                                    : <VentilationIcon size={ 22 } { ...props } />;
                        },
                        path: '/settings/0',
                        restricted: false,
                    },
                    {
                        id: 'heating-circuit-2',
                        text: regulatorSettings?.heatingCircuits.items[1].name,
                        iconRender: (props: IconBaseProps) => {
                            return regulatorSettings?.heatingCircuits.items[1].type === HeatingCircuitTypeModel.heating
                            ? <HeatSysIcon size={ 22 } { ...props } />
                            : regulatorSettings?.heatingCircuits.items[1].type === HeatingCircuitTypeModel.hotWater
                                ? <HotWaterIcon size={ 22 } { ...props } />
                                : <VentilationIcon size={ 22 } { ...props } />;
                        },
                        path: '/settings/1',
                        restricted: false,
                    }, {
                        id: 'app-settings',
                        text: 'Приложение',
                        iconRender: (props: IconBaseProps) => <AppSettingsIcon size={ 22 } { ...props } />,
                        path: '/app-settings',
                    }
                ]
            },
            {
                id: 'manual',
                text: 'Ручной режим',
                iconRender: (props: IconBaseProps) => <ManualModeIcon size={ 22 } { ...props } />,
                path: '/debug/1',
            },
            {
                id: 'debug',
                text: 'Отладка',
                iconRender: (props: IconBaseProps) => <DebugIcon size={ 22 } { ...props } />,
                path: '/debug/2',
                visible: regulatorSettings?.service.allowDebugMode
            },
            {
                id: 'rtc-clock',
                text: 'Часы RTC',
                iconRender: (props: IconBaseProps) => <RtcClockIcon size={ 22 } { ...props } />,
                command: 'workDate',
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
    }, [regulatorSettings?.heatingCircuits.items, regulatorSettings?.service.allowDebugMode]);
};
