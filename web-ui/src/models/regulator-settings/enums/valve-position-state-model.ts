export enum ValvePositionStateModel {
    halting = 1,
    opening = 2,
    closing = 3
}

export const ValvePositionStates = [
    { id: ValvePositionStateModel.halting, description: 'Останов' },
    { id: ValvePositionStateModel.opening, description: 'Открыт' },
    { id: ValvePositionStateModel.closing, description: 'Закрыт' },
]