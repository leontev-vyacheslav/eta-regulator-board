import { SerialRemoteConnectorBaudsModel } from './serial-remote-connector-bauds-model';
import { SerialRemoteConnectorBytesizesModel } from './serial-remote-connector-bytesizes-model';
import { SerialRemoteConnectorParitiesModel } from './serial-remote-connector-parities-model';
import { SerialRemoteConnectorStopbitsModel } from './serial-remote-connector-stopbits-model';


export type SerialRemoteConnectorSettingsModel = {
    port: string;

    baud: SerialRemoteConnectorBaudsModel;

    timeout: number;

    parity: SerialRemoteConnectorParitiesModel;

    stopbits: SerialRemoteConnectorStopbitsModel;

    bytesize: SerialRemoteConnectorBytesizesModel;
};
