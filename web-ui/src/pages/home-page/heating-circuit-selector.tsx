import { ReactElement, useCallback, useEffect, useState } from 'react';
import { HeatingCircuitIndexModel, HeatingCircuitTypeModel } from '../../models/regulator-settings/enums/heating-circuit-type-model';
import { ValveDirectionModel } from '../../models/regulator-settings/enums/valve-direction-model';
import { HeatSysContent } from './tab-contents/heat-sys-content/heat-sys-content';
import { HotWaterContent } from './tab-contents/hot-water-content/hot-water-content';
import { MnemoschemaProps } from '../../models/mnemoschema-props';
import { useRegulatorSettings } from '../../contexts/app-regulator-settings';
import { useAppData } from '../../contexts/app-data/app-data';
import { SharedRegulatorStateModel } from '../../models/regulator-settings/archive-model';
import { FailureActionTypeModel } from '../../models/regulator-settings/enums/failure-action-type-model';

export const HeatingCircuitSelector = ({ heatingCircuitIndex, mnemoschemaProps }: { heatingCircuitIndex: HeatingCircuitIndexModel, mnemoschemaProps?: MnemoschemaProps }) => {
    const { regulatorSettings } = useRegulatorSettings();
    const { getSharedRegulatorStateAsync } = useAppData();
    const [sharedRegulatorState, setSharedRegulatorState] = useState<SharedRegulatorStateModel>();

    const updateSharedRegulatorStateAsync = useCallback(async () => {
        const sharedRegulatorState = await getSharedRegulatorStateAsync(heatingCircuitIndex);
        console.log(sharedRegulatorState);

        if (sharedRegulatorState) {
            setSharedRegulatorState(sharedRegulatorState);
        } else {
            setSharedRegulatorState(
                {
                    failureActionState: FailureActionTypeModel.noAction,
                    supplyPipeTemperatureCalculated: Number.POSITIVE_INFINITY,
                    returnPipeTemperatureCalculated: Number.POSITIVE_INFINITY,
                    outdoorTemperature: Number.POSITIVE_INFINITY,
                    returnPipeTemperature: Number.POSITIVE_INFINITY,
                    supplyPipeTemperature: Number.POSITIVE_INFINITY,
                    valvePosition: Number.POSITIVE_INFINITY,
                    valveDirection: ValveDirectionModel.up
                } as SharedRegulatorStateModel
            );
        }
    }, [getSharedRegulatorStateAsync, heatingCircuitIndex]);

    useEffect(() => {
        (async () => {
            await updateSharedRegulatorStateAsync();
        })();

        const intervalTimer = setInterval(async () => {
            await updateSharedRegulatorStateAsync();
        }, 10000);

        return () => clearInterval(intervalTimer);
    }, [updateSharedRegulatorStateAsync]);

    let mnemoschema: ReactElement | null = null;

    switch (regulatorSettings?.heatingCircuits.items[heatingCircuitIndex].type) {
        case HeatingCircuitTypeModel.heating:
        case HeatingCircuitTypeModel.ventilation:
            mnemoschema = <HeatSysContent
                pumpOn={ true }
                supplyPipeTemperature={ 0.0 }
                supplyPipeTemperatureCalculated={ 0.0 }
                returnPipeTemperature={ 0.0 }
                returnPipeTemperatureCalculated={ 0.0 }
                outdoorTemperature={ 0.0 }
                valvePosition={ 0.0 }
                valveDirection={ ValveDirectionModel.down }
                { ...sharedRegulatorState }
                { ...mnemoschemaProps }
            />
            break;
        case HeatingCircuitTypeModel.hotWater:
            mnemoschema = <HotWaterContent
                pumpOn={ true }
                supplyPipeTemperature={ 0.0 }
                supplyPipeTemperatureCalculated={ 0.0 }
                returnPipeTemperature={ 0.0 }
                returnPipeTemperatureCalculated={ 0.0 }
                outdoorTemperature={ 0.0 }
                valvePosition={ 0.0 }
                valveDirection={ ValveDirectionModel.down }
                { ...sharedRegulatorState }
                { ...mnemoschemaProps }
            />
            break;
    }

    return mnemoschema;
}