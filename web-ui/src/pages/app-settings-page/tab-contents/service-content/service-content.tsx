import Form, { SimpleItem } from 'devextreme-react/form';
import { useRef } from 'react';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { FieldDataChangedEvent } from 'devextreme/ui/form';
import AppConstants from '../../../../constants/app-constants';
import { useRegulatorSettings } from '../../../../contexts/app-regulator-settings';

export const ServiceForm = () => {
    const dxServiceFormRef = useRef<Form>(null);
    const { regulatorSettings, setRegulatorSettings } = useRegulatorSettings();
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

                if (e.dataField === 'allowDebugMode') {
                    setRegulatorSettings(previous => {
                        previous!.service = { ...previous!.service };

                        return { ...previous! };
                    });
                }
            } }
        >

                <SimpleItem
                    dataField={ 'allowDebugMode' }
                    label={ { location: 'top', showColon: true, text: 'Режим отладки' } }
                    editorType={ 'dxSwitch' }
                />
        </Form>
    );
}