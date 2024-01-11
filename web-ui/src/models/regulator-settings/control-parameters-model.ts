import { ControlModeModel } from './enums/control-mode-model'
import { ManualControlModeModel } from './enums/manual-control-mode-model'
import { OutdoorTemperatureSensorFailureActionTypeModel } from './enums/outdoor-temperature-sensor-failure-action-type-model';
import { SupplyPipeTemperatureSensorFailureActionTypeModel } from './enums/supply-pipe-temperature-sensor-failure-action-type-model';

export type ControlParametersModel = {
    controlMode: ControlModeModel;

    manualControlMode?: ManualControlModeModel;

    manualControlModeTemperatureSetpoint?: number;

    outdoorTemperatureSensorFailureAction?: OutdoorTemperatureSensorFailureActionTypeModel;

    supplyPipeTemperatureSensorFailureAction?: SupplyPipeTemperatureSensorFailureActionTypeModel;

    analogValveErrorSetpoint: number;

    summerModeTransitionTemperature?: number;

    comfortTemperature: number;

    economicalTemperature: number;

    frostProtectionTemperature?: number;

    roomTemperatureInfluence?: number;

    returnPipeTemperatureInfluence: number;

    supplyPipeMinTemperature: number;

    supplyPipeMaxTemperature: number;

    controlCirculationPump: boolean;
}