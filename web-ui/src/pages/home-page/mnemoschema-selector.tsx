import { ReactElement } from 'react';
import { HeatingCircuitIndexModel, HeatingCircuitTypeModel } from '../../models/regulator-settings/enums/heating-circuit-type-model';
import { ValveDirectionModel } from '../../models/regulator-settings/enums/valve-direction-model';
import { HeatSysContent } from './tab-contents/heat-sys-content/heat-sys-content';
import { HotWaterContent } from './tab-contents/hot-water-content/hot-water-content';
import { useAppSettings } from '../../contexts/app-settings';
import { MnemoschemaProps } from '../../models/mnemoschema-props';

export const HeatingCircuitSelector = ({ heatingCircuitIndex, mnemoschemaProps }: { heatingCircuitIndex: HeatingCircuitIndexModel, mnemoschemaProps?: MnemoschemaProps }) => {
    const { regulatorSettings } = useAppSettings();
    let mnemoschema: ReactElement | null = null;

    switch (regulatorSettings?.heatingCircuits.items[heatingCircuitIndex].type) {
        case HeatingCircuitTypeModel.heating:
        case HeatingCircuitTypeModel.ventilation:
            mnemoschema = <HeatSysContent
                pumpOn={ true }
                supplyPipeTemperature={ 110.5 }
                supplyPipeTemperatureCalc={ 100 }
                returnPipeTemperature={ 90.35 }
                returnPipeTemperatureCalc={ 80 }
                outdoorTemperature={ -18.5 }
                valvePosition={ 53.5 }
                valveDirection={ ValveDirectionModel.down }
                { ...mnemoschemaProps }
            />
            break;
        case HeatingCircuitTypeModel.hotWater:
            mnemoschema = <HotWaterContent
                pumpOn={ true }
                supplyPipeTemperature={ 93.6 }
                supplyPipeTemperatureCalc={ 80 }
                returnPipeTemperature={ 66.5 }
                returnPipeTemperatureCalc={ 55 }
                valvePosition={ 67.8 }
                valveDirection={ ValveDirectionModel.up }
                { ...mnemoschemaProps }
            />
            break;
    }

    return mnemoschema;
}