import Form, { SimpleItem } from 'devextreme-react/form';
import { useRef } from 'react';
import { useSettingPageContext } from '../../settings-page-context';
import { FieldDataChangedEvent } from 'devextreme/ui/form';
import { useAppData } from '../../../../contexts/app-data/app-data';
import AppConstants from '../../../../constants/app-constants';
import { useAppSettings } from '../../../../contexts/app-settings';

export const RegulationParametersForm = () => {
    const dxRegulatorParametersFormRef = useRef<Form>(null);
    const { regulatorSettings } = useAppSettings();
    const { circuitId, currentHeatingCircuitType } = useSettingPageContext();
    const { putRegulatorSettingsAsync } = useAppData();

    return (
        <Form

            className='app-form setting-form'
            height={ AppConstants.formHeight }
            scrollingEnabled={ true }
            colCount={ 1 }
            formData={ regulatorSettings?.heatingCircuits.items[circuitId].regulatorParameters.regulationParameters }
            ref={ dxRegulatorParametersFormRef }
            onFieldDataChanged={ async (e: FieldDataChangedEvent) => {
                const regulatorSettingsChange = {
                    regulatorSettings: regulatorSettings!,
                    changeLogItem: {
                        dataField: e.dataField!,
                        datetime: new Date(),
                        path: 'regulatorParameters.regulationParameters',
                        value: e.value
                    }
                }
                await putRegulatorSettingsAsync(regulatorSettingsChange);
            } }
        >
            <SimpleItem
                dataField='proportionalityFactor'
                label={ { location: 'top', showColon: true, text: `Коэффициент пропорциональности (${ currentHeatingCircuitType.shotDescription })` } }
                editorType={ 'dxNumberBox' }
                editorOptions={ { showSpinButtons: true, min: 0, max: 100 } } />

            <SimpleItem
                dataField='integrationFactor'

                label={ { location: 'top', showColon: true, text: `Коэффициент интегрирования (${ currentHeatingCircuitType.shotDescription })` } }
                editorType={ 'dxNumberBox' }
                editorOptions={ { showSpinButtons: true, min: 0, max: 100 } } />

            <SimpleItem
                dataField='differentiationFactor'
                label={ { location: 'top', showColon: true, text: `Коэффициент дифференцирования (${ currentHeatingCircuitType.shotDescription })` } }
                editorType={ 'dxNumberBox' }
                editorOptions={ { showSpinButtons: true, min: 0, max: 100 } } />

            <SimpleItem
                dataField='calculationPeriod'
                label={ { location: 'top', showColon: true, text: `Период расчета, 100мс (${ currentHeatingCircuitType.shotDescription })` } }
                editorType={ 'dxNumberBox' }
                editorOptions={ { showSpinButtons: true, min: 1, max: 50 } } />

            <SimpleItem
                dataField='pulseDurationValve'
                label={ { location: 'top', showColon: true, text: `Длител. импульса регулирующего клапана, с (${ currentHeatingCircuitType.shotDescription })` } }
                editorType={ 'dxNumberBox' }
                editorOptions={ { showSpinButtons: true, min: 1, max: 20 } } />

            <SimpleItem
                dataField='driveUnitAnalogControl'
                label={ { location: 'top', showColon: true, text: `Привод с аналоговым управлением (${ currentHeatingCircuitType.shotDescription })` } }
                editorType={ 'dxSwitch' } />

        </Form>
    );
}