import './adc-tab-content.scss'
import { useCallback, useMemo, useState } from 'react';
import 'devextreme-react/text-area';
import { Form, GroupItem, SimpleItem } from 'devextreme-react/form';
import { useScreenSize } from '../../../../utils/media-query';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { Button } from 'devextreme-react/button';
import { CloseCircleIcon, StartIcon, StopIcon } from '../../../../constants/app-icons';

type AdcFormData = {
    channel: number;
    isReadContinually: boolean;
    readContinuallyInterval: number;
    timeoutObject: ReturnType<typeof setInterval> | null;
    fromTemperarureSensor: boolean;
    consoleContent: string,
    isStartedReading: boolean
}

// eslint-disable-next-line no-unused-vars
enum AdcReadMode {
    Adc = 1,
    Temp = 2
}

export const AdcTabContent = () => {
    const { isXSmall, isSmall } = useScreenSize();
    const { getAdcValueAsync, getTemperatureValueAsync } = useAppData();
    const [isShowOutputConsole, setIsShowOutputConsole] = useState<boolean>(false);
    const [isReadingEnabled, setIsReadingEnabled] = useState<boolean>(false);

    const formData = useMemo<AdcFormData>(() => {
        return {
            channel: 0,
            isReadContinually: true,
            readContinuallyInterval: 1,
            timeoutObject: null,
            fromTemperarureSensor: false,
            consoleContent: '',
            isStartedReading: false
        } as AdcFormData
    }, []);

    const channelList = useMemo(() => {
        return [
            { id: '453b87fb-8f2d-461f-bee9-239e2c7fbf17', pin: 0, description: 'Канал 0' },
            { id: '4ea8f075-1fc1-4b4a-a68f-30a47b9615d6', pin: 1, description: 'Канал 1' },
            { id: '6f9486da-2add-4157-a083-d46604d48e47', pin: 2, description: 'Канал 2' },
            { id: 'b25a5b95-cc68-4b35-ad9e-aa7fe6c9d2e7', pin: 3, description: 'Канал 3' },
            { id: 'c70c5d5b-adb2-47bb-8249-12ad89c42a95', pin: 4, description: 'Канал 4' },
            { id: 'a90a9023-004f-495b-97cd-c1a36e74dcf9', pin: 5, description: 'Канал 5' },
        ]
    }, []);

    const pushMessageToConsole = useCallback((message: string) => {

        let curentText = formData.consoleContent ;
        curentText = `${curentText}${(curentText ? '\n' : '')}${message}`
        formData.consoleContent =  curentText;

        const textAreaElement = document.querySelector('textarea[name="consoleContent"]') as HTMLTextAreaElement;
        if (textAreaElement) {
            textAreaElement.value = formData.consoleContent
            textAreaElement.scrollTop = textAreaElement.scrollHeight;
        }
    }, [formData]);

    const showValueAsync = useCallback(async (mode: AdcReadMode) => {
        const value = mode === AdcReadMode.Adc
            ? await getAdcValueAsync(formData.channel)
            : await getTemperatureValueAsync(formData.channel);

        if (value && formData.isStartedReading) {
            pushMessageToConsole(`Канал ${value?.channel}: ${value?.value.toFixed(3)}${mode === AdcReadMode.Adc ? 'V' : '°C'}`);
        }
    }, [formData.channel, formData.isStartedReading, getAdcValueAsync, getTemperatureValueAsync, pushMessageToConsole]);

    const scrollConsoleToBottom = useCallback(() => {
        const textAreaElement = document.querySelector('textarea[name="consoleContent"]') as HTMLTextAreaElement;
        if (textAreaElement) {
            textAreaElement.scrollTop = textAreaElement.scrollHeight;
        }
    }, []);

    const clearTimer = useCallback(() => {
        if (formData.timeoutObject) {
            clearInterval(formData.timeoutObject);
            formData.timeoutObject = null;
        }
    }, [formData]);

    const start = useCallback(() => {
        formData.isStartedReading = true;

        setIsShowOutputConsole(true);
        setIsReadingEnabled(true);

        formData.timeoutObject = setInterval(async () => {
            await showValueAsync(formData.fromTemperarureSensor ? AdcReadMode.Temp : AdcReadMode.Adc);
        }, 1000 * formData.readContinuallyInterval);
    }, [formData, showValueAsync]);

    const close = useCallback(() => {
        formData.isStartedReading = false;
        formData.consoleContent = '';

        clearTimer();

        setIsReadingEnabled(false);
        setIsShowOutputConsole(false);
    }, [clearTimer, formData]);

    const resume = useCallback(() => {
        formData.isStartedReading = true;

        scrollConsoleToBottom();

        formData.timeoutObject = setInterval(async () => {
            await showValueAsync(formData.fromTemperarureSensor ? AdcReadMode.Temp : AdcReadMode.Adc);
        }, 1000 * formData.readContinuallyInterval);
        setIsReadingEnabled(true);

    }, [formData, scrollConsoleToBottom, showValueAsync]);

    const stop = useCallback( () => {
        formData.isStartedReading = false;
        setIsReadingEnabled(false);

        clearTimer();

        setTimeout( () => {
            scrollConsoleToBottom();
        }, 500);

    }, [clearTimer, formData, scrollConsoleToBottom]);

    return (isShowOutputConsole
        ?
        <Form
            formData={ formData }
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
                    {isReadingEnabled ? <Button width={ 115 } type='danger' onClick={ stop }>
                        <StopIcon size={ 22 } /><span style={ { marginLeft: 5 } }>СТОП</span>
                    </Button>
                        :
                        <Button width={ 145 } type='success' style= { { backgroundColor: '#FFC107 ' } } onClick={ resume }>
                            <StartIcon size={ 22 } /><span style={ { marginLeft: 5 } }>ПРОДОЛЖИТЬ</span>
                        </Button>
                    }
                    <Button width={ 115 } type='normal' onClick={ close }>
                        <CloseCircleIcon size={ 22 } /><span style={ { marginLeft: 5 } }>ЗАКРЫТЬ</span>
                    </Button>
                </SimpleItem>
            </GroupItem>
        </Form>
        :
        <Form
            formData={ formData }
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
                    dataField='fromTemperarureSensor'
                    editorType='dxSwitch'
                    label={ { location: 'top', showColon: true, text: 'С температурного датчика' } }
                    editorOptions={ {
                        displayExpr: 'description',
                        valueExpr: 'pin',
                        items: channelList
                    } }
                />
                <SimpleItem cssClass='adc-form_buttons'>
                    <Button width={ 115 } text='Старт' type='success' onClick={ start } >
                        <StartIcon size={ 22 } /><span style={ { marginLeft: 5 } }>СТАРТ</span>
                    </Button>
                </SimpleItem>
            </GroupItem>
        </Form>
    );
}