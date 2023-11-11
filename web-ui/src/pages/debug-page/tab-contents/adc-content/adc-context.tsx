import Form from 'devextreme-react/form';
import { Dispatch, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AdcReadModeModel } from '../../../../models/regulator-settings/enums/adc-read-mode';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { useDebugPage } from '../../debug-page-content';

export type AdcChannelModel = {
    id: string;
    pin: number;
    description: string
}

export type AdcFormDataModel = {
    channel: number;
    isReadContinually: boolean;
    readContinuallyInterval: number;
    timeoutObject: ReturnType<typeof setInterval> | null;
    fromTemperarureSensor: boolean;
    consoleContent: string,
    isStartedReading: boolean
}

export type AdcContextModel = {
    adcFormData:AdcFormDataModel;
    adcChannelList: AdcChannelModel[];

    adcReadingSettingsFormRef: React.RefObject<Form>;
    adcReadingResultsFormRef: React.RefObject<Form>;

    isShowOutputConsole: boolean;
    setIsShowOutputConsole: Dispatch<React.SetStateAction<boolean>>;

    isReadingEnabled: boolean;
    setIsReadingEnabled: Dispatch<React.SetStateAction<boolean>>;

    scrollConsoleToBottom: () => void;
    clearTimer: () => void;
    showValueAsync: (mode: AdcReadModeModel) => Promise<void>;
};

const AdcContext = createContext({} as AdcContextModel);

function AdcContextProvider(props: any) {
    const { getAdcValueAsync, getTemperatureValueAsync } = useAppData();
    const [isShowOutputConsole, setIsShowOutputConsole] = useState<boolean>(false);
    const [isReadingEnabled, setIsReadingEnabled] = useState<boolean>(false);
    const adcReadingSettingsFormRef = useRef<Form>(null);
    const adcReadingResultsFormRef = useRef<Form>(null);
    const { tabPanelRef } = useDebugPage();

    const adcChannelList = useMemo<AdcChannelModel[]>(() => {
        return [
            { id: '453b87fb-8f2d-461f-bee9-239e2c7fbf17', pin: 0, description: 'Канал 0' },
            { id: '4ea8f075-1fc1-4b4a-a68f-30a47b9615d6', pin: 1, description: 'Канал 1' },
            { id: '6f9486da-2add-4157-a083-d46604d48e47', pin: 2, description: 'Канал 2' },
            { id: 'b25a5b95-cc68-4b35-ad9e-aa7fe6c9d2e7', pin: 3, description: 'Канал 3' },
            { id: 'c70c5d5b-adb2-47bb-8249-12ad89c42a95', pin: 4, description: 'Канал 4' },
            { id: 'a90a9023-004f-495b-97cd-c1a36e74dcf9', pin: 5, description: 'Канал 5' },
        ]
    }, []);

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
    }, [adcFormData, adcReadingResultsFormRef]);

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
    }, [adcReadingResultsFormRef]);

    const clearTimer = useCallback(() => {
        if (adcFormData.timeoutObject) {
            clearInterval(adcFormData.timeoutObject);
            adcFormData.timeoutObject = null;
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

    useEffect(() => {
        tabPanelRef.current?.instance.on('onSelectedIndexChange', (value: number) => {
            console.log(value);
        });
    }, [tabPanelRef]);

    return (
        <AdcContext.Provider value={ {
            adcFormData,
            adcChannelList,
            adcReadingSettingsFormRef,
            adcReadingResultsFormRef,
            isShowOutputConsole,
            setIsShowOutputConsole,
            isReadingEnabled,
            setIsReadingEnabled,
            scrollConsoleToBottom,
            clearTimer,
            showValueAsync
        } } { ...props }>

        </AdcContext.Provider>
    )
}

const useAdc = () => useContext(AdcContext);

export { AdcContextProvider, useAdc };
