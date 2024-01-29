import Form, { GroupItem, SimpleItem } from 'devextreme-react/form';
import { useRef } from 'react';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { FieldDataChangedEvent } from 'devextreme/ui/form';
import AppConstants from '../../../../constants/app-constants';
import { useRegulatorSettings } from '../../../../contexts/app-regulator-settings';
import { showAccessTokenPromptDialog } from '../../../../utils/dialogs';

export const InformationForm = () => {
    const dxServiceFormRef = useRef<Form>(null);
    const { regulatorSettings, refreshRegulatorSettingsAsync } = useRegulatorSettings();
    const { putRegulatorSettingsAsync } = useAppData();

    return (
        <Form
            className={ 'app-form setting-form' }
            height={ AppConstants.formHeight }
            scrollingEnabled={ true }
            colCount={ 1 }
            formData={ regulatorSettings?.service }
            ref={ dxServiceFormRef }
            onFieldDataChanged={ async (e: FieldDataChangedEvent) => {

                if (e.dataField === 'regulatorOwner.name' || e.dataField === 'regulatorOwner.phoneNumber') {
                    showAccessTokenPromptDialog({
                        callback: async ({ text: accessToken, modalResult }: { modalResult: string, text: string } ) => {
                            if (modalResult === 'OK' && accessToken) {
                                const updatedRegulatorSettings = await putRegulatorSettingsAsync(regulatorSettings!, accessToken);
                                if (!updatedRegulatorSettings) {
                                    await refreshRegulatorSettingsAsync();
                                }
                            } else {
                                await refreshRegulatorSettingsAsync();
                            }
                        }
                    });
                } else {
                    await putRegulatorSettingsAsync(regulatorSettings!)
                }
            } }
        >

            <GroupItem caption={ 'Собственник' }>
                <SimpleItem
                    dataField={ 'regulatorOwner.name' }
                    label={ { location: 'top', showColon: true, text: 'Собственник' } }
                    editorType={ 'dxTextBox' }
                    editorOptions={ {
                        buttons: [
                            {
                                name: 'restricted',
                                options: {
                                    disabled: true,
                                    icon: 'key',
                                    stylingMode: 'text',

                                }
                            }
                        ]
                    } }
                />
                <SimpleItem
                    dataField={ 'regulatorOwner.phoneNumber' }
                    label={ { location: 'top', showColon: true, text: 'Телефон' } }
                    editorType={ 'dxTextBox' }
                    editorOptions={ {
                        mask: '+7 (000) 000-00-00',
                        buttons: [
                            {

                                name: 'restricted',
                                options: {
                                    disabled: true,
                                    icon: 'key',
                                    stylingMode: 'text',
                                }
                            }
                        ]
                    } } />
            </GroupItem>

            <GroupItem caption='Версии ПО'>
                <SimpleItem
                    dataField={ 'softwareInfo.webApiVersion' }
                    label={ { location: 'top', showColon: true, text: 'Версия веб-api' } }
                    editorType={ 'dxTextBox' }
                    editorOptions={ {
                        readOnly: true
                    } } />
                <SimpleItem
                    dataField={ 'softwareInfo.webUiVersion' }
                    label={ { location: 'top', showColon: true, text: 'Версия приложения' } }
                    editorType={ 'dxTextBox' }
                    editorOptions={ {
                        readOnly: true
                    } } />
            </GroupItem>

        </Form>
    );
}