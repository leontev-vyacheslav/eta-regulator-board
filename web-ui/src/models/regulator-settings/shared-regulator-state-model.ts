import { ArchiveModel } from './archive-model';
import { PidImpactResultModel } from './pid-impact-result-model';
import { FailureActionTypeModel } from './enums/failure-action-type-model';


export type SharedRegulatorStateModel = ArchiveModel & PidImpactResultModel & {
    deltaDeviation: number;

    failureActionState: FailureActionTypeModel;

    supplyPipeTemperatureCalculated: number;

    returnPipeTemperatureCalculated: number;
};
