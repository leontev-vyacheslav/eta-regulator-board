import { Form, GroupItem, SimpleItem } from 'devextreme-react/form';
import { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useScreenSize } from '../../../../utils/media-query';
import { useSettingPageContext } from '../../settings-page-context';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { FieldDataChangedEvent } from 'devextreme/ui/form';
import { HeatingCircuitTypes } from '../../../../models/regulator-settings/enums/heating-circuit-type-model';
import { ValueChangedEvent } from 'devextreme/ui/select_box';

export const HeatingCircuitContent = () => {
    const { circuitId } = useParams();

    const dxHeatingCircuitFormRef = useRef<Form>(null);
    const { isXSmall, isSmall } = useScreenSize();
    const { regulatorSettings, setHeatingCircuitType } = useSettingPageContext();
    const { putRegulatorSettingsAsync } = useAppData();

    return (
        <Form
            className='app-form setting-form'
            height={ '50vh' }
            width={ isXSmall || isSmall ? '100%' : 600 }
            ref={ dxHeatingCircuitFormRef }
            formData={ regulatorSettings?.heatingCircuits.items[circuitId ? parseInt(circuitId) : 0] }
            onFieldDataChanged={ async (e: FieldDataChangedEvent) => {
                const regulutorSettingsChange = {
                    regulatorSettings: regulatorSettings!,
                    changeLogItem: {
                        dataField: e.dataField!,
                        datetime: new Date(),
                        path: 'regulatorSettings?.heatingCircuits.items',
                        value: e.value
                    }
                }

                await putRegulatorSettingsAsync(regulutorSettingsChange);
            } }
        >
            <GroupItem caption='Контур'>
                <SimpleItem
                    dataField='type'
                    label={ { location: 'top', showColon: true, text: 'Тип',  } }
                    editorType='dxSelectBox'
                    editorOptions={ {
                        items: HeatingCircuitTypes,
                        valueExpr: 'id',
                        displayExpr: 'description',
                        onValueChanged: (e: ValueChangedEvent) => {
                            setHeatingCircuitType(e.value);
                        } }
                    }
                />
                <SimpleItem
                    dataField='name'
                    label={ { location: 'top', showColon: true, text: 'Наименование' } }
                    editorType='dxTextBox'
                />
            </GroupItem>
        </Form>
    );
}