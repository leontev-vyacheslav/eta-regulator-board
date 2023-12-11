import { ControlParametersModel } from './control-parameters-model';
import { RegulationParametersModel } from './regulation-parameters-model';
import { TemperatureGraphModel } from './temperature-graph-model';
import { SchedulesModel } from './schedules-model'

export type RegulatorParametersModel = {
    controlParameters: ControlParametersModel;

    temperatureGraph: TemperatureGraphModel;

    schedules: SchedulesModel;

    regulationParameters: RegulationParametersModel;
}