/* eslint no-unused-vars: OFF */

export enum OutdoorTemperatureSensorFailureActionTypeModel {
    noAction = 1,
    closeValve = 2,
    openValve = 3,
    temperatureSustenance = 5
}

export const OutdoorTemperatureSensorFailureActionTypes = [
    { id: OutdoorTemperatureSensorFailureActionTypeModel.noAction, description: 'Бездействие' },
    { id: OutdoorTemperatureSensorFailureActionTypeModel.closeValve, description: 'Закрыть клапан' },
    { id: OutdoorTemperatureSensorFailureActionTypeModel.openValve, description: 'Открыть клапан' },
    { id: OutdoorTemperatureSensorFailureActionTypeModel.temperatureSustenance, description: 'Режим поддержания температуры' }
]