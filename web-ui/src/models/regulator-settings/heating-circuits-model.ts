import { HeatingCircuitTypeModel } from './enums/heating-circuit-type-model';
import { ControlParametersModel } from './control-parameters-model';
import { RegulationParametersModel } from './regulation-parameters-model';
import { TemperatureGraphModel } from './temperature-graph-model';
import { SchedulesModel } from './schedules-model'

export type HeatingCircuitModel = {
    id: string;

    name: string;

    type: HeatingCircuitTypeModel;

    controlParameters: ControlParametersModel;

    temperatureGraph: TemperatureGraphModel;

    schedules: SchedulesModel;

    regulationParameters: RegulationParametersModel;
}

export type HeatingCircuitsModel = {
    items: HeatingCircuitModel[];
}