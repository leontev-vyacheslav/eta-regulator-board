import Form, { GroupItem, SimpleItem } from 'devextreme-react/form';
import { StartIcon } from '../../../../constants/app-icons';
import Button from 'devextreme-react/button';
import { useAdc } from './adc-context';
import { useCallback } from 'react';
import { useScreenSize } from '../../../../utils/media-query';


export const AdcReadingSettingsForm = () => {
    const { isXSmall, isSmall } = useScreenSize();
    const { adcFormData, adcChannelList, adcReadingSettingsFormRef, setIsReadingEnabled, setIsShowOutputConsole, setTimer } = useAdc();

    const start = useCallback(() => {
        adcFormData.isStartedReading = true;
        setIsShowOutputConsole(true);
        setIsReadingEnabled(true);
        setTimer();
    }, [adcFormData, setIsReadingEnabled, setIsShowOutputConsole, setTimer]);

    const onFromTemperarureSensorValueChanged = useCallback((e) => {
        const readContinuallyIntervalNumberBox = adcReadingSettingsFormRef.current?.instance.getEditor('readContinuallyInterval');
        if (readContinuallyIntervalNumberBox) {
            adcFormData.readContinuallyInterval = e.value ? 2 : 1;

            readContinuallyIntervalNumberBox.option(
                e.value
                ? { value: adcFormData.readContinuallyInterval,  min: 5, max: 50,  step: 2 } as any
                : { value: adcFormData.readContinuallyInterval, min: 1, max: 10, step: 1 } as any
            );
        }
    }, [adcFormData, adcReadingSettingsFormRef]);

    return (
        <Form
            ref={ adcReadingSettingsFormRef }
            formData={ adcFormData }
            className='app-form adc-form'
            style={ { height: '50vh' } }
            height={ '50vh' }
            width={ isXSmall || isSmall ? '100%' : 600 }
            scrollingEnabled={ true }
            colCount={ 1 }
        >
            <GroupItem caption={ 'Каналы' }>
                <SimpleItem
                    dataField='channel'
                    editorType='dxSelectBox'
                    label={ { location: 'top', showColon: true, text: 'Номер канала' } }
                    editorOptions={ {
                        displayExpr: 'description',
                        valueExpr: 'pin',
                        items: adcChannelList
                    } }
                />
                <SimpleItem
                    dataField='readContinuallyInterval'
                    editorType='dxNumberBox'
                    label={ { location: 'top', showColon: true, text: 'Интервал чтения' } }
                    editorOptions={ {
                        min: 1,
                        max: 10,
                        step: 1,
                        showSpinButtons: true,
                    } }
                />
                <SimpleItem
                    dataField='fromTemperarureSensor'
                    editorType='dxSwitch'
                    label={ { location: 'top', showColon: true, text: 'С температурного датчика' } }
                    editorOptions={ {
                        onValueChanged: onFromTemperarureSensorValueChanged
                    } }
                />
                <SimpleItem cssClass='adc-form_buttons'>
                    <Button width={ 115 } text='Старт' style= { { backgroundColor: '#ff5722 ' } } type='success' onClick={ start } >
                        <StartIcon size={ 20 } /><span style={ { marginLeft: 5 } }>СТАРТ</span>
                    </Button>
                </SimpleItem>
            </GroupItem>
        </Form>
    );
}