export enum SerialRemoteConnectorBaudsModel {
    BAUD_200 = 200,
    BAUD_2400 = 2400,
    BAUD_4800 = 4800,
    BAUD_9600 = 9600,
    BAUD_19200 = 19200,
    BAUD_38400 = 38400,
    BAUD_57600 = 57600,
    BAUD_115200 = 115200
}

export const SerialRemoteConnectorBauds = [
    { id: SerialRemoteConnectorBaudsModel.BAUD_200, description: '200' },
    { id: SerialRemoteConnectorBaudsModel.BAUD_2400, description: '2400' },
    { id: SerialRemoteConnectorBaudsModel.BAUD_4800, description: '4800' },
    { id: SerialRemoteConnectorBaudsModel.BAUD_9600, description: '9600' },
    { id: SerialRemoteConnectorBaudsModel.BAUD_19200, description: '19200' },
    { id: SerialRemoteConnectorBaudsModel.BAUD_38400, description: '38400' },
    { id: SerialRemoteConnectorBaudsModel.BAUD_57600, description: '57600' },
    { id: SerialRemoteConnectorBaudsModel.BAUD_115200, description: '115200' },
]