export enum RegulatorStateModel {
    on = 1,
    off =2
}

export const RegulatorStates = [
    { id: RegulatorStateModel.on, description: 'Включен' },
    { id: RegulatorStateModel.off, description: 'Выключен' },
]