import { HeatingCircuitTypeModel } from './enums/heating-circuit-type-model';
import { RegulatorParametersModel } from './regulator-parameters-model';

export type HeatingCircuitModel = {
    id: string;

    name: string;

    type: HeatingCircuitTypeModel;

    regulatorParameters: RegulatorParametersModel;
}

export type HeatingCircuitsModel = {
    items: HeatingCircuitModel[];
}