import { ControlModeModel } from './enums/control-mode-model'
import { ManualControlModeModel } from './enums/manual-control-mode-model'

export type ControlParametersModel = {
    controlMode: ControlModeModel;

    manualControlMode: ManualControlModeModel;

    manualControlModeTemperatureSetpoint: number;

    analogValveErrorSetpoint: number;

    summerModeTransitionTemperature: number;

    comfortTemperature: number;

    economicalTemperature: number;

    frostProtectionTemperature: number;

    roomTemperartureInfluence: number;

    returnPipeTemperatureInfluience: number;

    supplyPipeMinTemperature: number;

    supplyPipeMaxTemperature: number;

    controlCirculationPump: boolean;
}