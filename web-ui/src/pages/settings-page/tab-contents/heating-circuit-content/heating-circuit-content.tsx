import { Form, GroupItem, SimpleItem } from 'devextreme-react/form';
import { useRef } from 'react';
import { useSettingPageContext } from '../../settings-page-context';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { FieldDataChangedEvent } from 'devextreme/ui/form';
import { HeatingCircuitTypes } from '../../../../models/regulator-settings/enums/heating-circuit-type-model';
import { ValueChangedEvent } from 'devextreme/ui/select_box';
import { MnemoschemaWrapper } from './mnemoschema-wrapper';
import AppConstants from '../../../../constants/app-constants';
import { showConfirmDialogEx } from '../../../../utils/dialogs';
import { formatMessage } from 'devextreme/localization';

export const HeatingCircuitContent = () => {
    const dxHeatingCircuitFormRef = useRef<Form>(null);
    const { regulatorSettings, setHeatingCircuitType, circuitId, heatingCircuitType, applyDefaultHeatCircuitSettingsAsync } = useSettingPageContext();
    const { putRegulatorSettingsAsync } = useAppData();

    return (
        <Form
            className='app-form setting-form'
            height={ AppConstants.formHeight }
            ref={ dxHeatingCircuitFormRef }
            scrollingEnabled={ true }
            formData={ regulatorSettings?.heatingCircuits.items[circuitId] }
            onFieldDataChanged={ async (e: FieldDataChangedEvent) => {
                const regulatorSettingsChange = {
                    regulatorSettings: regulatorSettings!,
                    changeLogItem: {
                        dataField: e.dataField!,
                        datetime: new Date(),
                        path: 'regulatorSettings?.heatingCircuits.items',
                        value: e.value
                    }
                }
                await putRegulatorSettingsAsync(regulatorSettingsChange);
            } }
        >
            <GroupItem caption='Контур'>
                <SimpleItem
                    dataField='type'
                    label={ { location: 'top', showColon: true, text: 'Тип' } }
                    editorType='dxSelectBox'
                    editorOptions={ {
                        items: HeatingCircuitTypes,
                        valueExpr: 'id',
                        displayExpr: 'description',
                        onValueChanged: (e: ValueChangedEvent) => {
                            if (e.value == heatingCircuitType) {
                                return;
                            }
                            if (e.event) {
                                const innerCallback = async (dialogResult?: boolean) => {
                                    if (dialogResult) {
                                        await applyDefaultHeatCircuitSettingsAsync(e.value);
                                    }

                                    setHeatingCircuitType(e.value);
                                };

                                showConfirmDialogEx({
                                    title: formatMessage('confirm-title'),
                                    iconName: 'SettingsIcon',
                                    iconSize: 32,
                                    callback: innerCallback,
                                    textRender: () => {
                                        return <>{formatMessage('confirm-dialog-se-default-heating-circuit-settings')}</>;
                                    }
                                });
                            }
                            else {
                                setHeatingCircuitType(e.value);
                            }
                        } }
                    }
                />
                <SimpleItem
                    dataField='name'
                    label={ { location: 'top', showColon: true, text: 'Наименование' } }
                    editorType='dxTextBox'

                />
                <SimpleItem
                    cssClass='heating-circuit-mnemoschema'
                    label={ { location: 'top', showColon: true, text: 'Мнемосхема' } } >
                    <MnemoschemaWrapper />
                </SimpleItem>
            </GroupItem>
        </Form>
    );
}