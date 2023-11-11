import './adc-tab-content.scss'
import { useCallback, useMemo, useRef, useState } from 'react';
import 'devextreme-react/text-area';
import { Form, GroupItem, SimpleItem } from 'devextreme-react/form';
import { useScreenSize } from '../../../../utils/media-query';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { Button } from 'devextreme-react/button';
import { CloseCircleIcon, StartIcon, StopIcon } from '../../../../constants/app-icons';
import { AdcReadModeModel } from '../../../../models/regulator-settings/enums/adc-read-mode';

type AdcFormDataModel = {
    channel: number;
    isReadContinually: boolean;
    readContinuallyInterval: number;
    timeoutObject: ReturnType<typeof setInterval> | null;
    fromTemperarureSensor: boolean;
    consoleContent: string,
    isStartedReading: boolean
}


export const AdcTabContent = () => {
    const { isXSmall, isSmall } = useScreenSize();
    const { getAdcValueAsync, getTemperatureValueAsync } = useAppData();
    const [isShowOutputConsole, setIsShowOutputConsole] = useState<boolean>(false);
    const [isReadingEnabled, setIsReadingEnabled] = useState<boolean>(false);
    const adcReadingSettingFormRef = useRef<Form>(null);
    const adcReadingResultsFormRef = useRef<Form>(null);

    const adcFormData = useMemo<AdcFormDataModel>(() => {
        return {
            channel: 0,
            isReadContinually: true,
            readContinuallyInterval: 1,
            timeoutObject: null,
            fromTemperarureSensor: false,
            consoleContent: '',
            isStartedReading: false
        } as AdcFormDataModel
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

        let curentText = adcFormData.consoleContent ;
        curentText = `${curentText}${(curentText ? '\n' : '')}${message}`
        adcFormData.consoleContent =  curentText;

        const textAreaElement = adcReadingResultsFormRef
            .current
            ?.instance
            .getEditor('consoleContent')
            ?.element()
            .querySelector('textarea') as HTMLTextAreaElement;

        if (textAreaElement) {
            textAreaElement.value = adcFormData.consoleContent
            textAreaElement.scrollTop = textAreaElement.scrollHeight;
        }
    }, [adcFormData]);

    const showValueAsync = useCallback(async (mode: AdcReadModeModel) => {
        const value = mode === AdcReadModeModel.Adc
            ? await getAdcValueAsync(adcFormData.channel)
            : await getTemperatureValueAsync(adcFormData.channel);

        if (value && adcFormData.isStartedReading) {
            pushMessageToConsole(`Канал ${value?.channel}: ${value?.value.toFixed(3)}${mode === AdcReadModeModel.Adc ? 'V' : '°C'}`);
        }
    }, [adcFormData.channel, adcFormData.isStartedReading, getAdcValueAsync, getTemperatureValueAsync, pushMessageToConsole]);

    const scrollConsoleToBottom = useCallback(() => {
        const textAreaElement = adcReadingResultsFormRef
            .current
            ?.instance
            .getEditor('consoleContent')
            ?.element()
            .querySelector('textarea') as HTMLTextAreaElement;

        if (textAreaElement) {
            textAreaElement.scrollTop = textAreaElement.scrollHeight;
        }
    }, []);

    const clearTimer = useCallback(() => {
        if (adcFormData.timeoutObject) {
            clearInterval(adcFormData.timeoutObject);
            adcFormData.timeoutObject = null;
        }
    }, [adcFormData]);

    const start = useCallback(() => {
        adcFormData.isStartedReading = true;

        setIsShowOutputConsole(true);
        setIsReadingEnabled(true);

        adcFormData.timeoutObject = setInterval(async () => {
            await showValueAsync(adcFormData.fromTemperarureSensor ? AdcReadModeModel.Temp : AdcReadModeModel.Adc);
        }, 1000 * adcFormData.readContinuallyInterval);
    }, [adcFormData, showValueAsync]);

    const close = useCallback(() => {
        adcFormData.isStartedReading = false;
        adcFormData.consoleContent = '';

        clearTimer();

        setIsReadingEnabled(false);
        setIsShowOutputConsole(false);
    }, [clearTimer, adcFormData]);

    const resume = useCallback(() => {
        adcFormData.isStartedReading = true;
        scrollConsoleToBottom();

        adcFormData.timeoutObject = setInterval(async () => {
            await showValueAsync(adcFormData.fromTemperarureSensor ? AdcReadModeModel.Temp : AdcReadModeModel.Adc);
        }, 1000 * adcFormData.readContinuallyInterval);

        setIsReadingEnabled(true);
    }, [adcFormData, scrollConsoleToBottom, showValueAsync]);

    const stop = useCallback( () => {
        adcFormData.isStartedReading = false;
        setIsReadingEnabled(false);

        clearTimer();

        setTimeout( () => {
            scrollConsoleToBottom();
        }, 500);

    }, [clearTimer, adcFormData, scrollConsoleToBottom]);

    return (isShowOutputConsole
        ?
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
        :
        <Form
            ref={ adcReadingSettingFormRef }
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
                        items: channelList,
                        onValueChanged: (e) => {
                            const readContinuallyIntervalNumberBox = adcReadingSettingFormRef.current?.instance.getEditor('readContinuallyInterval');
                            if (readContinuallyIntervalNumberBox) {
                                adcFormData.readContinuallyInterval = e.value ? 2 : 1;

                                readContinuallyIntervalNumberBox.option(
                                    e.value
                                    ? { value: adcFormData.readContinuallyInterval,  min: 5, max: 50,  step: 2 } as any
                                    : { value: adcFormData.readContinuallyInterval, min: 1, max: 10, step: 1 } as any
                                );
                            }
                        }
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