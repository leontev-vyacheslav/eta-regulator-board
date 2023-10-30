export type RegulationParametersModel = {
    proportionalityFactor: number;

    integrationFactor: number;

    differentiationFactor: number;

    calculationPeriod: number;

    pulseDurationValve: number;

    driveUnitAnalogControl: boolean;
}