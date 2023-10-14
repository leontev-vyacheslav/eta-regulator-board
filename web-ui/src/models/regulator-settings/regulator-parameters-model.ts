import { ControlParametersModel } from './control-parameters-model';
import { RegulationParametersModel } from './regulation-parameters-model';
import { TemperatureGraphModel } from './temperature-graph-model';
import { SchedulesModel } from './schelules-model'
import { RegulatorProgrammsModel } from './regulator-programms-model';
import { EmergencyVerificationModel } from './emergency-verification-model';

export type RegulatorParametersModel = {
    controlParameters: ControlParametersModel,

    temperatureGraph: TemperatureGraphModel,

    programms: RegulatorProgrammsModel,

    schedules: SchedulesModel,

    regulationParameters: RegulationParametersModel,

    emergencyVerification: EmergencyVerificationModel
}