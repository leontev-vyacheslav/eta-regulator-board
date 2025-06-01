import { SerialRemoteConnectorBaudsModel } from './serial-remote-connector-bauds-model';
import { SerialRemoteConnectorBytesizesModel } from './serial-remote-connector-bytesizes-model';
import { SerialRemoteConnectorStopbitsModel } from './serial-remote-connector-stopbits-model';


export type SerialRemoteConnectorSettingsModel = {
    baud: SerialRemoteConnectorBaudsModel;

    timeout: number;

    parity: boolean;

    stopbits: SerialRemoteConnectorStopbitsModel;

    bytesize: SerialRemoteConnectorBytesizesModel;
};
