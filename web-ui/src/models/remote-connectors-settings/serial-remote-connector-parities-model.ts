/* eslint no-unused-vars: OFF */

export enum SerialRemoteConnectorParitiesModel {
    NONE = 'N',
    EVEN = 'E',
    ODD = 'O',
    MARK = 'M',
    SPACE = 'S'
}

export const SerialRemoteConnectorParities = [
    { id: SerialRemoteConnectorParitiesModel.NONE, description: 'Нет' },
    { id: SerialRemoteConnectorParitiesModel.EVEN, description: 'Четный' },
    { id: SerialRemoteConnectorParitiesModel.ODD, description: 'Нечетный' },
    { id: SerialRemoteConnectorParitiesModel.MARK, description: 'Всегда 1' },
    { id: SerialRemoteConnectorParitiesModel.SPACE, description: 'Всегда 0' },
]
