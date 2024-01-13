import {  ReactElement } from 'react';
import { IconBaseProps } from 'react-icons';
import { HeatSysIcon, HotWaterIcon, VentilationIcon } from '../../constants/app-icons';
import { useAppSettings } from '../../contexts/app-settings';
import { HeatingCircuitIndexModel, HeatingCircuitTypeModel } from '../../models/regulator-settings/enums/heating-circuit-type-model';

export const HeatingCircuitIconSelector = ({ heatingCircuitIndex, iconProps }: { heatingCircuitIndex: HeatingCircuitIndexModel, iconProps?: IconBaseProps }) => {
        const { regulatorSettings } = useAppSettings();

        let icon: ReactElement | null;

        switch (regulatorSettings?.heatingCircuits.items[heatingCircuitIndex].type) {
            case HeatingCircuitTypeModel.heating:
                icon = <HeatSysIcon  size={ 18 } { ...iconProps }/>
                break;
            case HeatingCircuitTypeModel.hotWater:
                icon = <HotWaterIcon size={ 18 } { ...iconProps }/>
                break;
            case HeatingCircuitTypeModel.ventilation:
                icon = <VentilationIcon size={ 18 } { ...iconProps }/>
                break;
            default:
                icon = null;
        }

        return icon;
}