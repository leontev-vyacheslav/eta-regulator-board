import { useMemo } from 'react';
import { MnemoschemaProps } from '../../models/mnemoschema-props';
import { ValveDirectionModel } from '../../models/regulator-settings/enums/valve-direction-model';

export const useMnemoschemaDefaultProps = () => {

    return useMemo(() => {
        return {
            pumpOn: false,
            supplyPipeTemperature: 0.0,
            supplyPipeTemperatureCalculated: 0.0,
            returnPipeTemperature: 0.0,
            returnPipeTemperatureCalculated: 0.0,
            outdoorTemperature: 0.0,
            valveDirection: ValveDirectionModel.up,
            valvePosition: 100.0
        } as MnemoschemaProps;
    }, []);
}