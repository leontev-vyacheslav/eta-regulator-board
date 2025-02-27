import { FailureActionTypeModel } from './enums/failure-action-type-model';
import { ValveDirectionModel } from './enums/valve-direction-model';

export type ArchiveModel = {
    datetime: Date;

    outdoorTemperature: number;

    supplyPipeTemperature: number;

    returnPipeTemperature: number;

    isInitial?: boolean;
}

export type ArchiveExistsModel = {
    exists: boolean
}

export type PidImpactResultModel  = {

    deviation: number;

    totalDeviation: number;

    proportionalImpact: number;

    integrationImpact: number;

    differentiationImpact: number;

    impact: number;
}

export type SharedRegulatorStateModel = ArchiveModel & {
    failureActionState: FailureActionTypeModel;

    pidImpactResult: PidImpactResultModel;

    supplyPipeTemperatureCalculated: number;

    returnPipeTemperatureCalculated: number

    valveDirection: number;

    valvePosition: ValveDirectionModel;
}