import { Form, GroupItem, SimpleItem } from 'devextreme-react/form';
import {  useRef } from 'react';
import { useSettingPageContext } from '../../settings-page-context';
import { ControlModeModel, ControlModes } from '../../../../models/regulator-settings/enums/control-mode-model';
import { ManualControlModes } from '../../../../models/regulator-settings/enums/manual-control-mode-model';
import { FieldDataChangedEvent } from 'devextreme/ui/form';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { formatMessage } from 'devextreme/localization';
import { HeatingCircuitTypeModel } from '../../../../models/regulator-settings/enums/heating-circuit-type-model';
import AppConstants from '../../../../constants/app-constants';

export const ControlParametersForm = () => {
    const dxControlParametersFormRef = useRef<Form>(null);
    const { regulatorSettings, heatingCircuitType, circuitId, currentHeatingCircuitType } = useSettingPageContext();
    const { putRegulatorSettingsAsync } = useAppData();

    return regulatorSettings ?
        <Form
            className='app-form setting-form'
            height={ AppConstants.formHeight }
            scrollingEnabled={ true }
            colCount={ 1 }
            formData={ regulatorSettings?.heatingCircuits.items[circuitId].regulatorParameters.controlParameters }
            ref={ dxControlParametersFormRef }
            onFieldDataChanged={ async (e: FieldDataChangedEvent) => {
                const regulatorSettingsChange = {
                    regulatorSettings: regulatorSettings!,
                    changeLogItem: {
                        dataField: e.dataField!,
                        datetime: new Date(),
                        path: 'regulatorParameters.controlParameters',
                        value: e.value
                    }
                }

                await putRegulatorSettingsAsync(regulatorSettingsChange);
            } }
        >
            <GroupItem caption={ 'Режимы' }>
                <SimpleItem
                    dataField='controlMode'
                    label={ { location: 'top', showColon: true, text: `Режим управления (${ currentHeatingCircuitType!.shotDescription })` } }
                    editorType={ 'dxSelectBox' }
                    editorOptions={ { items: ControlModes.filter(c => heatingCircuitType === HeatingCircuitTypeModel.heating || c.id !== ControlModeModel.protect), valueExpr: 'id', displayExpr: 'description' } } />

                {heatingCircuitType !== HeatingCircuitTypeModel.hotWater
                    ? <SimpleItem
                        dataField='manualControlMode'
                        label={ { location: 'top', showColon: true, text: `Режим ручного управления (${ currentHeatingCircuitType!.shotDescription })` } }
                        editorType={ 'dxSelectBox' }
                        editorOptions={ { items: ManualControlModes, valueExpr: 'id', displayExpr: 'description' } } />
                    : null
                }

            </GroupItem>

            <GroupItem caption={ 'Уставки' }>
                {heatingCircuitType !== HeatingCircuitTypeModel.hotWater ? <SimpleItem
                    dataField='manualControlModeTemperatureSetpoint'
                    label={ { location: 'top', showColon: true, text: `Уставка поддерживаемой темп. ручного режима (${ currentHeatingCircuitType!.shotDescription })` } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ {
                        showSpinButtons: true,
                        min: currentHeatingCircuitType!.settings.manualControlModeTemperatureSetpointMin,
                        max: currentHeatingCircuitType!.settings.manualControlModeTemperatureSetpointMax,
                    } } />
                    : null
                }

                <SimpleItem
                    dataField='analogValveErrorSetpoint'
                    label={ { location: 'top', showColon: true, text: `Положение аналог.клапана в режиме аварии (${ currentHeatingCircuitType!.shotDescription })` } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ {
                        showSpinButtons: true,
                        min: currentHeatingCircuitType!.settings.analogValveErrorSetpointMin,
                        max: currentHeatingCircuitType!.settings.analogValveErrorSetpointMax,
                    } } />
            </GroupItem>

            <GroupItem caption={ 'Температуры' }>
                {heatingCircuitType !== HeatingCircuitTypeModel.hotWater ?
                    <SimpleItem
                        dataField='summerModeTransitionTemperature'
                        label={ { location: 'top', showColon: true, text: `Температура перехода в летний режим (${ currentHeatingCircuitType!.shotDescription })` } }
                        editorType={ 'dxNumberBox' }
                        editorOptions={ { showSpinButtons: true, min: 5, max: 15 } } />
                    : null
                }

                <SimpleItem
                    dataField='comfortTemperature'
                    label={ { location: 'top', showColon: true, text: `Температура комфортная (${ currentHeatingCircuitType!.shotDescription })` } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ {
                        showSpinButtons: true,
                        min: currentHeatingCircuitType!.settings.comfortTemperatureMin,
                        max: currentHeatingCircuitType!.settings.comfortTemperatureMax,
                    } } />

                <SimpleItem
                    dataField='economicalTemperature'
                    label={ { location: 'top', showColon: true, text: `Температура экономная (${ currentHeatingCircuitType!.shotDescription })` } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ {
                        showSpinButtons: true,
                        min: currentHeatingCircuitType!.settings.economicalTemperatureMin,
                        max: currentHeatingCircuitType!.settings.economicalTemperatureMax,
                    } }
                />
                {heatingCircuitType === HeatingCircuitTypeModel.heating ?
                    <SimpleItem
                        dataField='frostProtectionTemperature'
                        label={ { location: 'top', showColon: true, text: `Температура защиты от замерзания (${ currentHeatingCircuitType!.shotDescription })` } }
                        editorType={ 'dxNumberBox' }
                        editorOptions={ {
                            showSpinButtons: true,
                            min: 4,
                            max: 10,
                        } }
                    />
                    : null
                }
                 {heatingCircuitType === HeatingCircuitTypeModel.heating
                    ? <SimpleItem
                        dataField='roomTemperatureInfluence'
                        label={ { location: 'top', showColon: true, text:  `Влияние темп. помещения (${ currentHeatingCircuitType!.shotDescription })` } }
                        editorType={ 'dxNumberBox' }
                        editorOptions={ { showSpinButtons: true, min: 0, max: 50 } }
                    />
                    : null
                 }

                <SimpleItem
                    dataField='returnPipeTemperatureInfluence'
                    label={ { location: 'top', showColon: true, text: `Влияние темп. обратки (${ currentHeatingCircuitType!.shotDescription })` } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ { showSpinButtons: true, min: 0, max: 50 } } />

                <SimpleItem
                    dataField='supplyPipeMinTemperature'
                    label={ { location: 'top', showColon: true, text:  `Минимальная температура подачи (${ currentHeatingCircuitType!.shotDescription })` } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ { showSpinButtons: true, min: 30, max: 150 } } />

                <SimpleItem
                    dataField='supplyPipeMaxTemperature'
                    label={ { location: 'top', showColon: true, text: `Максимальная температура подачи (${ currentHeatingCircuitType!.shotDescription })` } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ { showSpinButtons: true, min: 30, max: 150 } } />
            </GroupItem>
            <GroupItem caption={ 'Насосы' }>
                <SimpleItem
                    dataField='controlCirculationPump'
                    label={ { location: 'top', showColon: true, text: `Управление циркуляционным насосом (${ currentHeatingCircuitType!.shotDescription })` } }
                    editorType={ 'dxSwitch' }
                    editorOptions={ { items: [1, 2] } } />

            </GroupItem>

        </Form>
        : <div className='dx-empty-message' style={ { height: '50vh' } }>{formatMessage('dxCollectionWidget-noDataText')}</div>
}