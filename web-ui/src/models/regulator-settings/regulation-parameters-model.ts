export type RegulationParametersModel = {
    proportionalityFactor: number

    integrationFactor: number

    differentiationFactor: number

    samplingTime: number

    reductionFactorPid: number

    valvePeriod: number

    analogControl: boolean
}