import { ControlModeModel } from './enums/control-mode-model'
import { ManualControlModeModel } from './enums/manual-control-mode-model'
import { ValvePositionStateModel } from './enums/valve-position-state'

export type ControlParametersModel = {
    controlMode: ControlModeModel;

    manualControlMode: ManualControlModeModel;

    valvePositionState: ValvePositionStateModel;

    manualControlModeTemperatureSetpoint: number;

    analogValveSetpoint: number;

    comfortTemperature: number;

    economicalTemperature: number;

    roomTemperartureInfluence: number;

    returnPipeTemperatureInfluience: number;

    supplyPipeMinTemperature: number;

    supplyPipeMaxTemperature: number;

    startingCirculationPump: number;

    startingRechargePump: number;
}