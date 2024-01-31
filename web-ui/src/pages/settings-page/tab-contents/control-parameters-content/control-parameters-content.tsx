import { Form, GroupItem, SimpleItem } from 'devextreme-react/form';
import {  useRef } from 'react';
import { useSettingPageContext } from '../../settings-page-context';
import { ControlModeModel, ControlModes } from '../../../../models/regulator-settings/enums/control-mode-model';
import { ManualControlModes } from '../../../../models/regulator-settings/enums/manual-control-mode-model';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { formatMessage } from 'devextreme/localization';
import { HeatingCircuitTypeModel } from '../../../../models/regulator-settings/enums/heating-circuit-type-model';
import AppConstants from '../../../../constants/app-constants';
import { OutdoorTemperatureSensorFailureActionTypes } from '../../../../models/regulator-settings/enums/outdoor-temperature-sensor-failure-action-type-model';
import { SupplyPipeTemperatureSensorFailureActionTypes } from '../../../../models/regulator-settings/enums/supply-pipe-temperature-sensor-failure-action-type-model';
import { useRegulatorSettings } from '../../../../contexts/app-regulator-settings';
import { useAuth } from '../../../../contexts/auth';
import { UserRoleModel } from '../../../../models/enums/user-role-model';

export const ControlParametersForm = () => {
    const dxControlParametersFormRef = useRef<Form>(null);
    const { regulatorSettings } = useRegulatorSettings();
    const { circuitId, currentHeatingCircuitType } = useSettingPageContext();
    const { putRegulatorSettingsAsync } = useAppData();
    const { getUserAuthDataFromStorage } = useAuth();
    const user = getUserAuthDataFromStorage();

    return regulatorSettings ?
        <Form
            className='app-form setting-form'
            height={ AppConstants.formHeight }
            scrollingEnabled={ true }
            colCount={ 1 }
            formData={ regulatorSettings?.heatingCircuits.items[circuitId].regulatorParameters.controlParameters }
            ref={ dxControlParametersFormRef }
            onFieldDataChanged={ async () => {
                await putRegulatorSettingsAsync(regulatorSettings!);
            } }
        >
            <GroupItem caption={ 'Режимы' }>
                <SimpleItem
                    dataField='controlMode'
                    label={ { location: 'top', showColon: true, text: `Режим управления (${ currentHeatingCircuitType.shotDescription })` } }
                    editorType={ 'dxSelectBox' }
                    editorOptions={ {
                        readOnly: user && user?.role !== UserRoleModel.admin,
                        items: ControlModes.filter(c => currentHeatingCircuitType.type === HeatingCircuitTypeModel.heating || c.id !== ControlModeModel.protect), valueExpr: 'id', displayExpr: 'description'
                    } } />

                {currentHeatingCircuitType.type !== HeatingCircuitTypeModel.hotWater
                    ? <SimpleItem
                        dataField='manualControlMode'
                        label={ { location: 'top', showColon: true, text: `Режим ручного управления (${ currentHeatingCircuitType.shotDescription })` } }
                        editorType={ 'dxSelectBox' }
                        editorOptions={ {
                            readOnly: user && user?.role !== UserRoleModel.admin,
                            items: ManualControlModes, valueExpr: 'id', displayExpr: 'description'
                        } } />
                    : null
                }
                {currentHeatingCircuitType.type !== HeatingCircuitTypeModel.hotWater
                    ? <SimpleItem
                            dataField='outdoorTemperatureSensorFailureAction'
                            label={ { location: 'top', showColon: true, text: `Действие при отказе датчика температуры нар.воздуха (${ currentHeatingCircuitType.shotDescription })` } }
                            editorType={ 'dxSelectBox' }
                            editorOptions={ {
                                readOnly: user && user?.role !== UserRoleModel.admin,
                                items: OutdoorTemperatureSensorFailureActionTypes, valueExpr: 'id', displayExpr: 'description'
                            } } />
                    : null
                }
                <SimpleItem
                        dataField='supplyPipeTemperatureSensorFailureAction'
                        label={ { location: 'top', showColon: true, text: `Действие при отказе датчика температуры подачи (${ currentHeatingCircuitType.shotDescription })` } }
                        editorType={ 'dxSelectBox' }
                        editorOptions={ {
                            readOnly: user && user?.role !== UserRoleModel.admin,
                            items: SupplyPipeTemperatureSensorFailureActionTypes, valueExpr: 'id', displayExpr: 'description'
                        } } />

            </GroupItem>

            <GroupItem caption={ 'Уставки' }>
                {currentHeatingCircuitType.type !== HeatingCircuitTypeModel.hotWater ? <SimpleItem
                    dataField='manualControlModeTemperatureSetpoint'
                    label={ { location: 'top', showColon: true, text: `Уставка поддерживаемой темп. ручного режима, °C (${ currentHeatingCircuitType.shotDescription })` } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ {
                        readOnly: user && user?.role !== UserRoleModel.admin,
                        showSpinButtons: true,
                        min: currentHeatingCircuitType.settings.manualControlModeTemperatureSetpointMin,
                        max: currentHeatingCircuitType.settings.manualControlModeTemperatureSetpointMax,
                    } } />
                    : null
                }

                <SimpleItem
                    dataField='analogValveErrorSetpoint'
                    label={ { location: 'top', showColon: true, text: `Положение аналог.клапана в режиме аварии, % (${ currentHeatingCircuitType.shotDescription })` } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ {
                        readOnly: user && user?.role !== UserRoleModel.admin,
                        showSpinButtons: true,
                        min: currentHeatingCircuitType.settings.analogValveErrorSetpointMin,
                        max: currentHeatingCircuitType.settings.analogValveErrorSetpointMax,
                    } } />
            </GroupItem>

            <GroupItem caption={ 'Температуры' }>
                {currentHeatingCircuitType.type !== HeatingCircuitTypeModel.hotWater ?
                    <SimpleItem
                        dataField='summerModeTransitionTemperature'
                        label={ { location: 'top', showColon: true, text: `Температура перехода в летний режим, °C (${ currentHeatingCircuitType.shotDescription })` } }
                        editorType={ 'dxNumberBox' }
                        editorOptions={ {
                            readOnly: user && user?.role !== UserRoleModel.admin,
                            showSpinButtons: true, min: 5, max: 15
                        } } />
                    : null
                }

                <SimpleItem
                    dataField='comfortTemperature'
                    label={ { location: 'top', showColon: true, text: `Температура комфортная, °C (${ currentHeatingCircuitType.shotDescription })` } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ {
                        readOnly: user && user?.role !== UserRoleModel.admin,
                        showSpinButtons: true,
                        min: currentHeatingCircuitType.settings.comfortTemperatureMin,
                        max: currentHeatingCircuitType.settings.comfortTemperatureMax,
                    } } />

                <SimpleItem
                    dataField='economicalTemperature'
                    label={ { location: 'top', showColon: true, text: `Температура экономная, °C (${ currentHeatingCircuitType.shotDescription })` } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ {
                        readOnly: user && user?.role !== UserRoleModel.admin,
                        showSpinButtons: true,
                        min: currentHeatingCircuitType.settings.economicalTemperatureMin,
                        max: currentHeatingCircuitType.settings.economicalTemperatureMax,
                    } }
                />
                {currentHeatingCircuitType.type === HeatingCircuitTypeModel.heating ?
                    <SimpleItem
                        dataField='frostProtectionTemperature'
                        label={ { location: 'top', showColon: true, text: `Температура защиты от замерзания, °C (${ currentHeatingCircuitType.shotDescription })` } }
                        editorType={ 'dxNumberBox' }
                        editorOptions={ {
                            readOnly: user && user?.role !== UserRoleModel.admin,
                            showSpinButtons: true,
                            min: 4,
                            max: 10,
                        } }
                    />
                    : null
                }
                 {currentHeatingCircuitType.type === HeatingCircuitTypeModel.heating
                    ? <SimpleItem
                        dataField='roomTemperatureInfluence'
                        label={ { location: 'top', showColon: true, text:  `Влияние темп. помещения, 0.1°C (${ currentHeatingCircuitType.shotDescription })` } }
                        editorType={ 'dxNumberBox' }
                        editorOptions={ {
                            readOnly: user && user?.role !== UserRoleModel.admin,
                            showSpinButtons: true, min: 0, max: 50
                        } }
                    />
                    : null
                 }

                <SimpleItem
                    dataField='returnPipeTemperatureInfluence'
                    label={ { location: 'top', showColon: true, text: `Влияние темп. обратки, 0.1°C (${ currentHeatingCircuitType.shotDescription })` } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ {
                        readOnly: user && user?.role !== UserRoleModel.admin,
                        showSpinButtons: true, min: 0, max: 50
                    } } />

                <SimpleItem
                    dataField='supplyPipeMinTemperature'
                    label={ { location: 'top', showColon: true, text:  `Минимальная температура подачи, °C (${ currentHeatingCircuitType.shotDescription })` } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ {
                        readOnly: user && user?.role !== UserRoleModel.admin,
                        showSpinButtons: true, min: 30, max: 150
                    } } />

                <SimpleItem
                    dataField='supplyPipeMaxTemperature'
                    label={ { location: 'top', showColon: true, text: `Максимальная температура подачи, °C (${ currentHeatingCircuitType.shotDescription })` } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ {
                        readOnly: user && user?.role !== UserRoleModel.admin,
                        showSpinButtons: true, min: 30, max: 150
                    } } />
            </GroupItem>

            <GroupItem caption={ 'Насосы' }>
                <SimpleItem
                    dataField='controlCirculationPump'
                    label={ { location: 'top', showColon: true, text: `Управление циркуляционным насосом (${ currentHeatingCircuitType.shotDescription })` } }
                    editorType={ 'dxSwitch' }
                    editorOptions={ {
                        readOnly: user && user?.role !== UserRoleModel.admin,
                        items: [1, 2]
                    } } />
            </GroupItem>
        </Form>
        : <div className='dx-empty-message' style={ { height: '50vh' } }>{formatMessage('dxCollectionWidget-noDataText')}</div>
}