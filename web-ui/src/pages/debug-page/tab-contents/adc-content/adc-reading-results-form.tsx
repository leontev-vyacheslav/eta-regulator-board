import Button from 'devextreme-react/button';
import Form, { GroupItem, SimpleItem } from 'devextreme-react/form';
import { CloseCircleIcon, StartIcon, StopIcon } from '../../../../constants/app-icons';
import { useAdc } from './adc-context';
import { useCallback } from 'react';
import AppConstants from '../../../../constants/app-constants';

export const AdcReadingResultsForm = () => {

    const {
        readingResults,
        adcReadingResultsFormRef,
        setIsReadingEnabled,
        isReadingEnabled,
        setIsShowOutputConsole,
        scrollBottom,
        setTimer,
        clearTimer
    } = useAdc();

    const close = useCallback(() => {
        readingResults.isStartedReading = false;
        readingResults.consoleContent = '';
        clearTimer();
        setIsReadingEnabled(false);
        setIsShowOutputConsole(false);
    }, [readingResults, clearTimer, setIsReadingEnabled, setIsShowOutputConsole]);

    const resume = useCallback(() => {
        readingResults.isStartedReading = true;
        setTimer();
        setIsReadingEnabled(true);
        setTimeout( () => {
            scrollBottom();
        }, 100);
    }, [readingResults, scrollBottom, setIsReadingEnabled, setTimer]);

    const stop = useCallback( () => {
        readingResults.isStartedReading = false;
        setIsReadingEnabled(false);
        clearTimer();
        setTimeout( () => {
            scrollBottom();
        }, 100);
    }, [readingResults, setIsReadingEnabled, clearTimer, scrollBottom]);

    return (
        <Form
            ref = { adcReadingResultsFormRef }
            formData={ readingResults }
            className='app-form debug-form adc-form'
            style={ { height: '50vh' } }
            height={ AppConstants.formHeight }
            scrollingEnabled={ true }
            colCount={ 1 }
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