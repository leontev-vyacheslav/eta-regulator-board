import Form, { GroupItem, SimpleItem } from 'devextreme-react/form';
import { useRef } from 'react';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { FieldDataChangedEvent } from 'devextreme/ui/form';
import AppConstants from '../../../../constants/app-constants';
import { useRegulatorSettings } from '../../../../contexts/app-regulator-settings';

export const InformationForm = () => {
    const dxServiceFormRef = useRef<Form>(null);
    const { regulatorSettings } = useRegulatorSettings();
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
                const regulatorSettingsChange = {
                    regulatorSettings: regulatorSettings!,
                    changeLogItem: {
                        dataField: e.dataField!,
                        datetime: new Date(),
                        path: 'regulatorSettings.service',
                        value: e.value
                    }
                }
                await putRegulatorSettingsAsync(regulatorSettingsChange);
            } }
        >

            <GroupItem caption={ 'Собственник' }>
                <SimpleItem
                    dataField={ 'regulatorOwner.name' }
                    label={ { location: 'top', showColon: true, text: 'Собственник' } }
                    editorType={ 'dxTextBox' }
                />
                <SimpleItem
                    dataField={ 'regulatorOwner.phoneNumber' }
                    label={ { location: 'top', showColon: true, text: 'Телефон' } }
                    editorType={ 'dxTextBox' }
                    editorOptions={ {
                        mask: '+7 (000) 000-00-00'
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