import { SerialRemoteConnectorSettingsModel } from './serial-remote-connector-settings-model';
import { TcpRemoteConnectorSettingsModel } from './tcp-remote-connector-settings-model';


export type RemoteConnectorsSettingsModel = {
    tcp: TcpRemoteConnectorSettingsModel;

    serial: SerialRemoteConnectorSettingsModel;
};
