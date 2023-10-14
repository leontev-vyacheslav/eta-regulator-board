import Form, { SimpleItem } from 'devextreme-react/form';
import { useScreenSize } from '../../utils/media-query';
import { useRef } from 'react';

export const RegulatorParametersForm = () => {
    const dxRegulatorParametersFormRef = useRef<Form>(null);
    const { isXSmall, isSmall } = useScreenSize();

    return (
        <Form
            className='app-form setting-form'
            height={ '50vh' }
            width={ isXSmall || isSmall ? '100%' : 600 }
            scrollingEnabled={ true }
            colCount={ 1 }
            formData={ null }
            ref={ dxRegulatorParametersFormRef }
        >
            <SimpleItem
                dataField='proportionalityFactor'
                label={ { location: 'top', showColon: true, text: 'Коэффициент пропорциональности' } }
                editorType={ 'dxNumberBox' }
                editorOptions={ { showSpinButtons: true, min: 0, max: 100, value: 40 } } />

            <SimpleItem
                dataField='integrationFactor'
                label={ { location: 'top', showColon: true, text: 'Коэффициент интегрирования' } }
                editorType={ 'dxNumberBox' }
                editorOptions={ { showSpinButtons: true, min: 0, max: 100, value: 3 } } />

            <SimpleItem
                dataField='differentiationFactor'
                label={ { location: 'top', showColon: true, text: 'Коэффициент дифференцирования' } }
                editorType={ 'dxNumberBox' }
                editorOptions={ { showSpinButtons: true, min: 0, max: 100, value: 2 } } />

            <SimpleItem
                dataField='samplingTime'
                label={ { location: 'top', showColon: true, text: 'Время дискретизации' } }
                editorType={ 'dxNumberBox' }
                editorOptions={ { showSpinButtons: true, min: 0, max: 100, value: 10 } } />

            <SimpleItem
                dataField='reductionFactorPid'
                label={ { location: 'top', showColon: true, text: 'Коэффициент снижения ПИД' } }
                editorType={ 'dxNumberBox' }
                editorOptions={ { showSpinButtons: true, min: 0, max: 100, value: 1 } } />

            <SimpleItem
                dataField='valvePeriod'
                label={ { location: 'top', showColon: true, text: 'Период клапана' } }
                editorType={ 'dxNumberBox' }
                editorOptions={ { showSpinButtons: true, min: 0, max: 100, value: 0 } } />

            <SimpleItem
                dataField='analogСontrol'
                label={ { location: 'top', showColon: true, text: 'Аналоговое управление' } }
                editorType={ 'dxCheckBox' }
                editorOptions={ { value: false } } />

        </Form>
    );
}