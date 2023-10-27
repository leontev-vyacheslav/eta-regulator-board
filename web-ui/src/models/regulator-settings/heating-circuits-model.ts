import { RegulatorParametersModel } from './regulator-parameters-model';

export type HeatingCircuitModel = {
    name: string;

    regulatorParameters: RegulatorParametersModel
}

export type HeatingCircuitsModel = {
    items: HeatingCircuitModel[];
}