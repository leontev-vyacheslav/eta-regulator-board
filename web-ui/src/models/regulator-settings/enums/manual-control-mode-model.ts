export enum ManualControlModeModel {
    valve = 1,
    temperature = 2
}

export const ManualControlModes = [
    { id: ManualControlModeModel.valve, description: 'Клапан' },
    { id: ManualControlModeModel.temperature, description: 'Температура' },
]