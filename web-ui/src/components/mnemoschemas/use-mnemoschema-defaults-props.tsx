import { useMemo } from 'react';
import { MnemoschemaProps } from '../../models/mnemoschema-props';
import { FailureActionTypeModel } from '../../models/regulator-settings/enums/failure-action-type-model';

export const useMnemoschemaDefaultProps = () => {

    return useMemo(() => {
        return {
            pumpOn: false,

            deltaDeviation: Number.POSITIVE_INFINITY,
            deviation: Number.POSITIVE_INFINITY,
            totalDeviation: Number.POSITIVE_INFINITY,
            proportionalImpact: Number.POSITIVE_INFINITY,
            integrationImpact: Number.POSITIVE_INFINITY,
            differentiationImpact: Number.POSITIVE_INFINITY,
            impact: Number.POSITIVE_INFINITY,

            failureActionState: FailureActionTypeModel.noAction,

            supplyPipeTemperatureCalculated: Number.POSITIVE_INFINITY,
            returnPipeTemperatureCalculated: Number.POSITIVE_INFINITY,

            datetime: new Date(),
            outdoorTemperature: Number.POSITIVE_INFINITY,
            roomTemperature: Number.POSITIVE_INFINITY,
            supplyPipeTemperature: Number.POSITIVE_INFINITY,
            returnPipeTemperature: Number.POSITIVE_INFINITY,
        } as MnemoschemaProps;
    }, []);
}