import Button from 'devextreme-react/button';
import Form, { GroupItem, SimpleItem } from 'devextreme-react/form';
import { CloseCircleIcon, StartIcon, StopIcon } from '../../../../constants/app-icons';
import { useAdc } from './adc-context';
import { useCallback } from 'react';
import { AdcReadModeModel } from '../../../../models/regulator-settings/enums/adc-read-mode';

export const AdcReadingResultsForm = () => {
    const {
        adcFormData,
        adcReadingResultsFormRef,
        setIsReadingEnabled,
        isReadingEnabled,
        setIsShowOutputConsole,
        scrollConsoleToBottom,
        clearTimer,
        showValueAsync
    } = useAdc();

    const close = useCallback(() => {
        adcFormData.isStartedReading = false;
        adcFormData.consoleContent = '';

        clearTimer();

        setIsReadingEnabled(false);
        setIsShowOutputConsole(false);
    }, [adcFormData, clearTimer, setIsReadingEnabled, setIsShowOutputConsole]);

    const resume = useCallback(() => {
        adcFormData.isStartedReading = true;
        scrollConsoleToBottom();

        adcFormData.timeoutObject = setInterval(async () => {
            await showValueAsync(adcFormData.fromTemperarureSensor ? AdcReadModeModel.Temp : AdcReadModeModel.Adc);
        }, 1000 * adcFormData.readContinuallyInterval);

        setIsReadingEnabled(true);
    }, [adcFormData, scrollConsoleToBottom, setIsReadingEnabled, showValueAsync]);

    const stop = useCallback( () => {
        adcFormData.isStartedReading = false;
        setIsReadingEnabled(false);

        clearTimer();

        setTimeout( () => {
            scrollConsoleToBottom();
        }, 500);

    }, [adcFormData, clearTimer, scrollConsoleToBottom, setIsReadingEnabled]);

    return (
        <Form
            ref = { adcReadingResultsFormRef }
            formData={ adcFormData }
            className='app-form adc-form'
            style={ { height: '50vh' } }
            height={ '50vh' }
        >
            <GroupItem caption={ 'Результаты считывания' }>
                <SimpleItem
                    dataField='consoleContent'
                    label={ { location: 'top', showColon: true, text: 'Консоль вывода' } }
                    editorType='dxTextArea'
                    editorOptions={ {
                        height: '30vh', spellcheck:  false, readOnly: true
                    } }
                >
                </SimpleItem>
                <SimpleItem cssClass='adc-form_buttons'>
                    {isReadingEnabled
                        ?
                        <Button width={ 115 } type='danger' onClick={ stop }>
                            <StopIcon size={ 20 } /><span style={ { marginLeft: 5 } }>СТОП</span>
                        </Button>
                        :
                        <Button width={ 145 } type='success' style= { { backgroundColor: '#FFC107 ' } } onClick={ resume }>
                            <StartIcon size={ 20 } /><span style={ { marginLeft: 5 } }>ПРОДОЛЖИТЬ</span>
                        </Button>
                    }
                    <Button width={ 115 } type='normal' onClick={ close }>
                        <CloseCircleIcon size={ 20 } /><span style={ { marginLeft: 5 } }>ЗАКРЫТЬ</span>
                    </Button>
                </SimpleItem>
            </GroupItem>
        </Form>
    );
}