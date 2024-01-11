
export enum SupplyPipeTemperatureSensorFailureActionTypeModel {
    noAction = 1,
    closeValve = 2,
    openValve = 3,
    analogValveError = 4
}

export const SupplyPipeTemperatureSensorFailureActionTypes = [
    { id: SupplyPipeTemperatureSensorFailureActionTypeModel.noAction, description: 'Бездействие' },
    { id: SupplyPipeTemperatureSensorFailureActionTypeModel.closeValve, description: 'Закрыть клапан' },
    { id: SupplyPipeTemperatureSensorFailureActionTypeModel.openValve, description: 'Открыть клапан' },
    { id: SupplyPipeTemperatureSensorFailureActionTypeModel.analogValveError, description: 'Аналоговый клапан в режиме аварии' }
]