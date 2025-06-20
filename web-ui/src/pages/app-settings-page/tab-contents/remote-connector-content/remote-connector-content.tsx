import Form, { GroupItem, SimpleItem } from 'devextreme-react/form';
import AppConstants from '../../../../constants/app-constants';
import { useEffect, useRef, useState } from 'react';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { RemoteConnectorsSettingsModel } from '../../../../models/remote-connectors-settings/remote-connectors-settings-model';
import { SerialRemoteConnectorBauds } from '../../../../models/remote-connectors-settings/serial-remote-connector-bauds-model';
import { SerialRemoteConnectorStopbits } from '../../../../models/remote-connectors-settings/serial-remote-connector-stopbits-model';
import { SerialRemoteConnectorBytesizes } from '../../../../models/remote-connectors-settings/serial-remote-connector-bytesizes-model';
import { SerialRemoteConnectorParities } from '../../../../models/remote-connectors-settings/serial-remote-connector-parities-model';
import { proclaim } from '../../../../utils/proclaim';
import { formatMessage } from 'devextreme/localization';

export const RemoteConnectorForm = () => {
    const dxServiceFormRef = useRef<Form>(null);
    const { getRemoteConnectorsSettingsAsync, putRemoteConnectorsSettingsAsync } = useAppData();
    const [remoteConnectorsSettings, setRemoteConnectorsSettings] = useState<RemoteConnectorsSettingsModel | null>();

    useEffect(() => {
        (async () => {
            const remoteConnectorsSettings = await getRemoteConnectorsSettingsAsync();
            if (remoteConnectorsSettings) {
                setRemoteConnectorsSettings(remoteConnectorsSettings);
            }
        })();
    }, [getRemoteConnectorsSettingsAsync]);

    return (
        <Form
            className={ 'app-form setting-form' }
            height={ AppConstants.formHeight }
            scrollingEnabled={ true }
            colCount={ 1 }
            formData={ remoteConnectorsSettings }
            ref={ dxServiceFormRef }
            onFieldDataChanged={ async () => {
                const settings = await putRemoteConnectorsSettingsAsync(remoteConnectorsSettings!);

                if (settings) {
                    proclaim({
                        type: 'success',
                        message: formatMessage('app-remote-connector-settings-applying'),
                        displayTime: 30000000,
                        position: {
                            my: 'top center',
                            at: 'top center',
                            of: window
                        },
                    });
                }
            } }
        >
            <GroupItem caption={ 'TCP сервер' }>
                <SimpleItem
                    dataField='tcp.port'
                    label={ { location: 'top', showColon: true, text: 'Прослушиваемый порт' } }
                    editorType={ 'dxNumberBox' }
                />

            </GroupItem>

            <GroupItem caption={ 'RTU сервер' }>
                <SimpleItem
                    dataField='serial.port'
                    label={ { location: 'top', showColon: true, text: 'Прослушиваемый порт' } }
                    editorType={ 'dxTextBox' }
                />

                <SimpleItem
                    dataField='serial.baud'
                    label={ { location: 'top', showColon: true, text: 'Скорость' } }
                    editorType={ 'dxSelectBox' }
                    editorOptions={ {
                        items: SerialRemoteConnectorBauds,
                        valueExpr: 'id',
                        displayExpr: 'description',
                    } }
                />

                <SimpleItem
                    dataField='serial.timeout'
                    label={ { location: 'top', showColon: true, text: 'Время ожидания соединения' } }
                    editorType={ 'dxNumberBox' }
                />

                <SimpleItem
                    dataField='serial.parity'
                    label={ { location: 'top', showColon: true, text: 'Контроль четности' } }
                    editorType={ 'dxSelectBox' }
                    editorOptions={ {
                        items: SerialRemoteConnectorParities,
                        valueExpr: 'id',
                        displayExpr: 'description',
                    } }
                />

                <SimpleItem
                    dataField='serial.stopbits'
                    label={ { location: 'top', showColon: true, text: 'Стоп-биты' } }
                    editorType={ 'dxSelectBox' }
                    editorOptions={ {
                        items: SerialRemoteConnectorStopbits,
                        valueExpr: 'id',
                        displayExpr: 'description',
                    } }
                />

                <SimpleItem
                    dataField='serial.bytesize'
                    label={ { location: 'top', showColon: true, text: 'Размер байта' } }
                    editorType={ 'dxSelectBox' }
                    editorOptions={ {
                        items: SerialRemoteConnectorBytesizes,
                        valueExpr: 'id',
                        displayExpr: 'description',
                    } }
                />
            </GroupItem>
        </Form>
    );
}