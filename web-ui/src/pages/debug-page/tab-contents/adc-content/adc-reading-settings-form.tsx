import Form, { GroupItem, SimpleItem } from 'devextreme-react/form';
import { StartIcon } from '../../../../constants/app-icons';
import Button from 'devextreme-react/button';
import { useAdc } from './adc-context';
import { useCallback } from 'react';
import AppConstants from '../../../../constants/app-constants';
import { useDebugPage } from '../../debug-page-content';


export const AdcReadingSettingsForm = () => {
    const { modeId } = useDebugPage();
    const { readingSettings, readingResults, channelList, adcReadingSettingsFormRef, setIsReadingEnabled, setIsShowOutputConsole, setTimer } = useAdc();

    const start = useCallback(() => {
        readingResults.isStartedReading = true;
        setIsShowOutputConsole(true);
        setIsReadingEnabled(true);
        setTimer();
    }, [readingResults, setIsReadingEnabled, setIsShowOutputConsole, setTimer]);

    const onFromTemperatureSensorValueChanged = useCallback((e) => {
        const readContinuallyIntervalNumberBox = adcReadingSettingsFormRef.current?.instance.getEditor('readContinuallyInterval');
        if (readContinuallyIntervalNumberBox) {
            readingSettings.readContinuallyInterval = e.value ? 2 : 1;

            readContinuallyIntervalNumberBox.option(
                e.value
                ? { value: readingSettings.readContinuallyInterval,  min: 5, max: 50,  step: 2 } as any
                : { value: readingSettings.readContinuallyInterval, min: 1, max: 10, step: 1 } as any
            );
        }
    }, [readingSettings, adcReadingSettingsFormRef]);

    return (
        <Form
            ref={ adcReadingSettingsFormRef }
            formData={ readingSettings }
            className='app-form debug-form adc-form'
            // style={ { height: '50vh' } }
            height={ AppConstants.formHeight }
            scrollingEnabled={ true }
            colCount={ 1 }
        >
            <GroupItem caption={ 'Каналы' }>
                <SimpleItem
                    dataField='channel'
                    editorType='dxSelectBox'
                    label={ { location: 'top', showColon: true, text: 'Наименование канала' } }
                    editorOptions={ {
                        displayExpr: 'description',
                        valueExpr: 'pin',
                        items: channelList
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
                    dataField='fromTemperatureSensor'
                    editorType='dxSwitch'
                    label={ { location: 'top', showColon: true, text: 'С температурного датчика' } }
                    editorOptions={ {
                        onValueChanged: onFromTemperatureSensorValueChanged,
                        defaultValue: modeId == 1,
                        readOnly:  modeId == 1,
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