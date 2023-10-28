import Form, { SimpleItem } from 'devextreme-react/form';
import { useScreenSize } from '../../../../utils/media-query';
import { useRef } from 'react';
import { useSettingPageContext } from '../../settings-page-context';
import { FieldDataChangedEvent } from 'devextreme/ui/form';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { useParams } from 'react-router-dom';

export const RegulationParametersForm = () => {
    const { circuitId } = useParams();
    const dxRegulatorParametersFormRef = useRef<Form>(null);
    const { isXSmall, isSmall } = useScreenSize();
    const { regulatorSettings } = useSettingPageContext();
    const { putRegulatorSettingsAsync } = useAppData();

    return (
        <Form

            className='app-form setting-form'
            height={ '50vh' }
            width={ isXSmall || isSmall ? '100%' : 600 }
            scrollingEnabled={ true }
            colCount={ 1 }
            formData={ regulatorSettings?.heatingCircuits.items[circuitId ? parseInt(circuitId) : 0].regulatorParameters.regulationParameters }
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
                label={ { location: 'top', showColon: true, text: 'Коэффициент пропорциональности' } }
                editorType={ 'dxNumberBox' }
                editorOptions={ { showSpinButtons: true, min: 0, max: 100 } } />

            <SimpleItem
                dataField='integrationFactor'

                label={ { location: 'top', showColon: true, text: 'Коэффициент интегрирования' } }
                editorType={ 'dxNumberBox' }
                editorOptions={ { showSpinButtons: true, min: 0, max: 100 } } />

            <SimpleItem
                dataField='differentiationFactor'
                label={ { location: 'top', showColon: true, text: 'Коэффициент дифференцирования' } }
                editorType={ 'dxNumberBox' }
                editorOptions={ { showSpinButtons: true, min: 0, max: 100 } } />

            <SimpleItem
                dataField='samplingTime'
                label={ { location: 'top', showColon: true, text: 'Время дискретизации' } }
                editorType={ 'dxNumberBox' }
                editorOptions={ { showSpinButtons: true, min: 0, max: 100 } } />

            <SimpleItem
                dataField='reductionFactorPid'
                label={ { location: 'top', showColon: true, text: 'Коэффициент снижения ПИД' } }
                editorType={ 'dxNumberBox' }
                editorOptions={ { showSpinButtons: true, min: 0, max: 100 } } />

            <SimpleItem
                dataField='valvePeriod'
                label={ { location: 'top', showColon: true, text: 'Период клапана' } }
                editorType={ 'dxNumberBox' }
                editorOptions={ { showSpinButtons: true, min: 0, max: 100 } } />

            <SimpleItem
                dataField='analogControl'
                label={ { location: 'top', showColon: true, text: 'Аналоговое управление' } }
                editorType={ 'dxCheckBox' }
                editorOptions={ { } } />

        </Form>
    );
}