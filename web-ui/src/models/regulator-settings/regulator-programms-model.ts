import { ValvePositionStateModel } from './enums/valve-position-state'

export type RegulatorProgrammsModel = {
    systemType: number;

    controlCirculationPumps: boolean;

    heatSystemOff: boolean;

    monitoringCirculationPumps: boolean;

    switchingCirculationPumps: boolean;

    switchingCirculationPumpsPeriod: number;

    valvePositionByOutdoorTemperatureError: ValvePositionStateModel;

    valvePositionBySupplyTemperatureError: ValvePositionStateModel;
}