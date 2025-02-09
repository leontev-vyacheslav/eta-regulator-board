import { FailureActionTypeModel } from './enums/failure-action-type-model';
import { ValveDirectionModel } from './enums/valve-direction-model';

export type ArchiveModel = {
    datetime: Date;

    outdoorTemperature: number;

    supplyPipeTemperature: number;

    returnPipeTemperature: number;
}

export type ArchiveExistsModel = {
    exists: boolean
}

export type SharedRegulatorStateModel = ArchiveModel & {
    failureActionState: FailureActionTypeModel;

    supplyPipeTemperatureCalculated: number;

    returnPipeTemperatureCalculated: number

    valveDirection: number;

    valvePosition: ValveDirectionModel;
}