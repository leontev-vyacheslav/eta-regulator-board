import { Form, GroupItem, SimpleItem } from 'devextreme-react/form';
import { useScreenSize } from '../../../../utils/media-query';
import { useRef } from 'react';
import { useSettingPageContext } from '../../settings-page-context';

export const ControlParametersForm = () => {
    const dxControlParametersFormRef = useRef<Form>(null);
    const { isXSmall, isSmall } = useScreenSize();
    const { regulatorSettings } = useSettingPageContext();

    return (
        <Form
            className='app-form setting-form'
            height={ '50vh' }
            width={ isXSmall || isSmall ? '100%' : 600 }
            scrollingEnabled={ true }
            colCount={ 1 }
            formData={ regulatorSettings?.regulatorParameters.controlParameters }
            ref={ dxControlParametersFormRef }
        >
            <GroupItem caption={ 'Режимы' }>
                <SimpleItem
                    dataField='controlMode'
                    label={ { location: 'top', showColon: true, text: 'Режим управления' } }
                    editorType={ 'dxSelectBox' }
                    editorOptions={ { items: [1, 2] } } />

                <SimpleItem
                    dataField='manualControlMode'
                    label={ { location: 'top', showColon: true, text: 'Режим ручного управления' } }
                    editorType={ 'dxSelectBox' }
                    editorOptions={ { items: [1, 2] } } />

                <SimpleItem
                    dataField='valvePositionState'
                    label={ { location: 'top', showColon: true, text: 'Действие клапана' } }
                    editorType={ 'dxSelectBox' }
                    editorOptions={ { items: [1, 2] } } />
            </GroupItem>

            <GroupItem caption={ 'Уставки' }>
                <SimpleItem
                    dataField='manualControlModeTemperatureSetpoint'
                    label={ { location: 'top', showColon: true, text: 'Уставка темп. ручного режима' } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ { showSpinButtons: true, min: 30, max: 100 } } />

                <SimpleItem
                    dataField='analogValveSetpoint'
                    label={ { location: 'top', showColon: true, text: 'Уставка темп. ручного режима' } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ { showSpinButtons: true, min: 0, max: 100 } } />
            </GroupItem>
            <GroupItem caption={ 'Температуры' }>
                <SimpleItem
                    dataField='comfortTemperature'
                    label={ { location: 'top', showColon: true, text: 'Температура комфортная' } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ { showSpinButtons: true, min: 15, max: 30 } } />

                <SimpleItem
                    dataField='economicalTemperature'
                    label={ { location: 'top', showColon: true, text: 'Температура экономная' } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ { showSpinButtons: true, min: 15, max: 30 } } />

                <SimpleItem
                    dataField='roomTemperartureInfluence'
                    label={ { location: 'top', showColon: true, text: 'Влияние темп. помещения' } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ { showSpinButtons: true, min: 1, max: 5 } } />

                <SimpleItem
                    dataField='returnPipeTemperatureInfluience'
                    label={ { location: 'top', showColon: true, text: 'Влияние темп. обратки' } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ { showSpinButtons: true, min: 1, max: 5 } } />


                <SimpleItem
                    dataField='supplyPipeMinTemperature'
                    label={ { location: 'top', showColon: true, text: 'Минимальная температура подачи' } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ { showSpinButtons: true, min: 30, max: 50 } } />

                <SimpleItem
                    dataField='supplyPipeMaxTemperature'
                    label={ { location: 'top', showColon: true, text: 'Максимальная температура подачи' } }
                    editorType={ 'dxNumberBox' }
                    editorOptions={ { showSpinButtons: true, min: 50, max: 100 } } />
            </GroupItem>
            <GroupItem caption={ 'Насосы' }>
                <SimpleItem
                    dataField='startingCirculationPump'
                    label={ { location: 'top', showColon: true, text: 'Стартовый циркуляционный насос' } }
                    editorType={ 'dxSelectBox' }
                    editorOptions={ { items: [1, 2] } } />

                <SimpleItem
                    dataField='startingRechargePump'
                    label={ { location: 'top', showColon: true, text: 'Стартовый подпиточный насос' } }
                    editorType={ 'dxSelectBox' }
                    editorOptions={ { items: [1, 2] } } />
            </GroupItem>

        </Form>
    );
}