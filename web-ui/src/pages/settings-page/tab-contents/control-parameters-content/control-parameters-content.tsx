import { Form, GroupItem, SimpleItem } from 'devextreme-react/form';
import { useScreenSize } from '../../../../utils/media-query';
import { useMemo, useRef } from 'react';
import { useSettingPageContext } from '../../settings-page-context';
import { ControlModes } from '../../../../models/regulator-settings/enums/control-mode-model';
import {  ManualControlModes } from '../../../../models/regulator-settings/enums/manual-control-mode-model';
import { FieldDataChangedEvent } from 'devextreme/ui/form';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { formatMessage } from 'devextreme/localization';
import {  HeatingCircuitTypes } from '../../../../models/regulator-settings/enums/heating-circuit-type-model';

export const ControlParametersForm = () => {
    const dxControlParametersFormRef = useRef<Form>(null);
    const { isXSmall, isSmall } = useScreenSize();
    const { regulatorSettings, heatingCircuitType, circuitId } = useSettingPageContext();
    const { putRegulatorSettingsAsync } = useAppData();

    const currentHeatingCircuitType = useMemo(() => {
        return HeatingCircuitTypes.find(t => t.id === heatingCircuitType);
    }, [heatingCircuitType]);

    return regulatorSettings ?
        <Form
            className='app-form setting-form'
            height={ '50vh' }
            width={ isXSmall || isSmall ? '100%' : 600 }
            scrollingEnabled={ true }
            colCount={ 1 }
            formData={ regulatorSettings?.heatingCircuits.items[circuitId].regulatorParameters.controlParameters }
            ref={ dxControlParametersFormRef }
            onFieldDataChanged={ async (e: FieldDataChangedEvent) => {
                const regulutorSettingsChange = {
                    regulatorSettings: regulatorSettings!,
                    changeLogItem: {
                        dataField: e.dataField!,
                        datetime: new Date(),
                        path: 'regulatorParameters.controlParameters',
                        value: e.value
                    }
                }

                await putRegulatorSettingsAsync(regulutorSettingsChange);
            } }
        >
            <GroupItem caption={ 'Режимы' }>
                <SimpleItem
                    dataField='controlMode'
                    label={ { location: 'top', showColon: true, text: 'Режим управления' } }
                    editorType={ 'dxSelectBox' }
                    editorOptions={ { items: ControlModes, valueExpr: 'id', displayExpr: 'description' } } />

                <SimpleItem
                    dataField='manualControlMode'
                    label={ { location: 'top', showColon: true, text: 'Режим ручного управления' } }
                    editorType={ 'dxSelectBox' }
                    editorOptions={ { items: ManualControlModes, valueExpr: 'id', displayExpr: 'description' } } />

            </GroupItem>

            <GroupItem caption={ 'Уставки' }>
                <SimpleItem
                    dataField='manualControlModeTemperatureSetpoint'
                    label={ { location: 'top', showColon: true, text: 'Уставка поддерживаемой темп. ручного режима' } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ { showSpinButtons: true, min: 30, max: 150 } } />

                <SimpleItem
                    dataField='analogValveErrorSetpoint'
                    label={ { location: 'top', showColon: true, text: 'Положение аналог.клапана в режиме аварии' } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ { showSpinButtons: true, min: 0, max: 100 } } />
            </GroupItem>

            <GroupItem caption={ 'Температуры' }>
            <SimpleItem
                    dataField='summerModeTransitionTemperature'
                    label={ { location: 'top', showColon: true, text: 'Температура перехода в летний режим' } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ { showSpinButtons: true, min: 5, max: 15 } } />

                <SimpleItem
                    dataField='comfortTemperature'
                    label={ { location: 'top', showColon: true, text: 'Температура комфортная' } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ {
                        showSpinButtons: true,
                        min: currentHeatingCircuitType!.settings.comfortTemperatureMin,
                        max: currentHeatingCircuitType!.settings.comfortTemperatureMax,
                    } } />

                <SimpleItem
                    dataField='economicalTemperature'
                    label={ { location: 'top', showColon: true, text: 'Температура экономная' } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ {
                        showSpinButtons: true,
                        min: currentHeatingCircuitType!.settings.economicalTemperatureMin,
                        max: currentHeatingCircuitType!.settings.economicalTemperatureMax,
                    } }
                    />
                <SimpleItem
                    dataField='frostProtectionTemperature'
                    label={ { location: 'top', showColon: true, text: 'Температура защиты от замерзания' } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ {
                        showSpinButtons: true,
                        min: 4,
                        max: 10,
                    } }
                />
                <SimpleItem
                    dataField='roomTemperatureInfluence'
                    label={ { location: 'top', showColon: true, text: 'Влияние темп. помещения' } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ { showSpinButtons: true, min: 0, max: 50  } }
                    />

                <SimpleItem
                    dataField='returnPipeTemperatureInfluence'
                    label={ { location: 'top', showColon: true, text: 'Влияние темп. обратки' } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ { showSpinButtons: true, min: 0, max: 50 } } />

                <SimpleItem
                    dataField='supplyPipeMinTemperature'
                    label={ { location: 'top', showColon: true, text: 'Минимальная температура подачи' } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ { showSpinButtons: true, min: 30, max: 150 } } />

                <SimpleItem
                    dataField='supplyPipeMaxTemperature'
                    label={ { location: 'top', showColon: true, text: 'Максимальная температура подачи' } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ { showSpinButtons: true, min: 30, max: 150 } } />
            </GroupItem>
            <GroupItem caption={ 'Насосы' }>
                <SimpleItem
                    dataField='controlCirculationPump'
                    label={ { location: 'top', showColon: true, text: 'Управление циркуляционным насосом' } }
                    editorType={ 'dxSwitch' }
                    editorOptions={ { items: [1, 2] } } />

            </GroupItem>

        </Form>
        : <div className='dx-empty-message' style={ { height: '50vh' } }>{formatMessage('dxCollectionWidget-noDataText')}</div>
}