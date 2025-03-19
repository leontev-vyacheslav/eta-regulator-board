import { ReactElement, useCallback, useEffect, useState } from 'react';
import { HeatingCircuitIndexModel, HeatingCircuitTypeModel } from '../../models/regulator-settings/enums/heating-circuit-type-model';
import { HeatSysContent } from './tab-contents/heat-sys-content/heat-sys-content';
import { HotWaterContent } from './tab-contents/hot-water-content/hot-water-content';
import { useRegulatorSettings } from '../../contexts/app-regulator-settings';
import { useAppData } from '../../contexts/app-data/app-data';
import { SharedRegulatorStateModel } from '../../models/regulator-settings/shared-regulator-state-model';
import { FailureActionTypeModel } from '../../models/regulator-settings/enums/failure-action-type-model';

const defultSharedRegulatorState =
{
    deltaDeviation: Number.POSITIVE_INFINITY,
    deviation: Number.POSITIVE_INFINITY,
    totalDeviation: Number.POSITIVE_INFINITY,
    proportionalImpact: Number.POSITIVE_INFINITY,
    integrationImpact: Number.POSITIVE_INFINITY,
    differentiationImpact: Number.POSITIVE_INFINITY,
    impact: Number.POSITIVE_INFINITY,

    failureActionState: FailureActionTypeModel.noAction,

    datetime: new Date(),
    outdoorTemperature: Number.POSITIVE_INFINITY,
    roomTemperature: Number.POSITIVE_INFINITY,
    supplyPipeTemperature: Number.POSITIVE_INFINITY,
    returnPipeTemperature: Number.POSITIVE_INFINITY,

    supplyPipeTemperatureCalculated: Number.POSITIVE_INFINITY,
    returnPipeTemperatureCalculated: Number.POSITIVE_INFINITY,
} as SharedRegulatorStateModel;

export const HeatingCircuitSelector = ({ heatingCircuitIndex }: { heatingCircuitIndex: HeatingCircuitIndexModel }) => {
    const { regulatorSettings } = useRegulatorSettings();
    const { getSharedRegulatorStateAsync } = useAppData();
    const [sharedRegulatorState, setSharedRegulatorState] = useState<SharedRegulatorStateModel>(defultSharedRegulatorState);

    const updateSharedRegulatorStateAsync = useCallback(async () => {
        const sharedRegulatorState = await getSharedRegulatorStateAsync(heatingCircuitIndex);

        if (sharedRegulatorState) {
            setSharedRegulatorState(sharedRegulatorState);
        } else {
            setSharedRegulatorState(defultSharedRegulatorState);
        }
    }, [getSharedRegulatorStateAsync, heatingCircuitIndex]);

    useEffect(() => {
        (async () => {
            await updateSharedRegulatorStateAsync();
        })();

        const intervalTimer = setInterval(async () => {
            await updateSharedRegulatorStateAsync();
        }, 30000);

        return () => clearInterval(intervalTimer);
    }, [updateSharedRegulatorStateAsync]);

    let mnemoschema: ReactElement | null = null;

    switch (regulatorSettings?.heatingCircuits.items[heatingCircuitIndex].type) {
        case HeatingCircuitTypeModel.heating:
        case HeatingCircuitTypeModel.ventilation:
            mnemoschema = <HeatSysContent
                pumpOn={ true }
                { ...sharedRegulatorState! }
            />
            break;
        case HeatingCircuitTypeModel.hotWater:
            mnemoschema = <HotWaterContent
                pumpOn={ true }
                { ...sharedRegulatorState! }
            />
            break;
    }

    return mnemoschema;
}