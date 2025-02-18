import { PidImpactResultModel } from './regulator-settings/archive-model';
import { ValveDirectionModel } from './regulator-settings/enums/valve-direction-model';

export type MnemoschemaProps = {
    pumpOn: boolean;

    supplyPipeTemperature: number;
    supplyPipeTemperatureCalculated: number;

    returnPipeTemperature: number;
    returnPipeTemperatureCalculated: number;

    outdoorTemperature?: number;

    valvePosition: number;

    valveDirection: ValveDirectionModel;

    pidImpactResult?: PidImpactResultModel;
}