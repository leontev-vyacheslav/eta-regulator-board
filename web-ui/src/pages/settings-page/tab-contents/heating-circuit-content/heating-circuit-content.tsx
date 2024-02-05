import { useRef } from 'react';
import { Form, GroupItem, SimpleItem } from 'devextreme-react/form';
import { useSettingPageContext } from '../../settings-page-context';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { FieldDataChangedEvent } from 'devextreme/ui/form';
import { HeatingCircuitTypes } from '../../../../models/regulator-settings/enums/heating-circuit-type-model';
import { ValueChangedEvent } from 'devextreme/ui/select_box';
import { MnemoschemaWrapper } from './mnemoschema-wrapper';
import AppConstants from '../../../../constants/app-constants';
import { showConfirmDialogEx } from '../../../../utils/dialogs';
import { formatMessage } from 'devextreme/localization';
import { useRegulatorSettings } from '../../../../contexts/app-regulator-settings';
import { useAuth } from '../../../../contexts/auth';

export const HeatingCircuitContent = () => {
    const dxHeatingCircuitFormRef = useRef<Form>(null);
    const { regulatorSettings, setRegulatorSettings } = useRegulatorSettings();
    const { circuitId, applyDefaultHeatCircuitSettingsAsync, currentHeatingCircuitType } = useSettingPageContext();
    const { putRegulatorSettingsAsync } = useAppData();
    const { isAdmin } = useAuth();

    return (
        <Form
            className='app-form setting-form'
            height={ AppConstants.formHeight }
            ref={ dxHeatingCircuitFormRef }
            scrollingEnabled={ true }
            formData={ regulatorSettings?.heatingCircuits.items[circuitId] }
            onFieldDataChanged={ async (e: FieldDataChangedEvent) => {
                if (e.dataField === 'type') {
                    return;
                }
                await putRegulatorSettingsAsync(regulatorSettings!);

                if (e.dataField === 'name') {
                    setRegulatorSettings(previous => {
                        previous!.heatingCircuits.items = [...previous!.heatingCircuits.items];

                        return { ...previous! };
                    });
                }
            } }
        >
            <GroupItem caption='Контур'>
                <SimpleItem
                    dataField='type'
                    label={ { location: 'top', showColon: true, text: 'Тип' } }
                    editorType='dxSelectBox'
                    editorOptions={ {
                        readOnly: !isAdmin(),
                        items: HeatingCircuitTypes,
                        valueExpr: 'type',
                        displayExpr: 'description',
                        onValueChanged: (e: ValueChangedEvent) => {

                            if (e.value == currentHeatingCircuitType.type) {
                                return;
                            }

                            if (e.event) {
                                const innerCallback = async (dialogResult?: boolean) => {
                                    if (dialogResult) {
                                        await applyDefaultHeatCircuitSettingsAsync(e.value);
                                        // ?
                                        // setRegulatorSettings((previous) => {
                                        //     previous!.heatingCircuits.items[circuitId].type = e.value
                                        //     return { ...previous! };
                                        // });
                                    } else {
                                        const previousValue = e.previousValue;
                                        e.component.instance().option('value', previousValue);
                                    }
                                };

                                showConfirmDialogEx({
                                    title: formatMessage('confirm-title'),
                                    iconName: 'SettingsIcon',
                                    iconSize: 32,
                                    callback: innerCallback,
                                    textRender: () => {
                                        return <>{formatMessage('confirm-dialog-change-heating-circuit-type')}</>;
                                    }
                                });
                            }
                            else {
                                console.log(e);

                                // setRegulatorSettings((previous) => {
                                //     previous!.heatingCircuits.items[circuitId].type = e.value
                                //     return { ...previous! };
                                // })
                            }
                        } }
                    }
                />
                <SimpleItem
                    dataField='name'
                    label={ { location: 'top', showColon: true, text: 'Наименование' } }
                    editorType='dxTextBox'
                    editorOptions={ {
                        readOnly: !isAdmin()
                    } }
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