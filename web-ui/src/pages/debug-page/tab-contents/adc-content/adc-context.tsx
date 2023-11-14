import Form from 'devextreme-react/form';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AdcReadModeModel } from '../../../../models/regulator-settings/enums/adc-read-mode';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { useDebugPage } from '../../debug-page-content';
import { useSharedArea } from '../../../../contexts/shared-area';
import { getUuidV4 } from '../../../../utils/uuid';
import { AdcChannelModel, AdcContextModel, AdcReadingResultsModel, AdcReadingSettingsModel } from '../../../../models/adc-channel-context-model';
import { DisposedTimerModel } from '../../../../models/disposed-timer-storage-model';


const AdcContext = createContext({} as AdcContextModel);

function AdcContextProvider(props: any) {
    const { getAdcValueAsync, getTemperatureValueAsync } = useAppData();
    const [isShowOutputConsole, setIsShowOutputConsole] = useState<boolean>(false);
    const [isReadingEnabled, setIsReadingEnabled] = useState<boolean>(false);
    const adcReadingSettingsFormRef = useRef<Form>(null);
    const adcReadingResultsFormRef = useRef<Form>(null);
    const { tabPanelRef } = useDebugPage();
    const { disposedTimerDispatcher } = useSharedArea();

    useEffect(() => {
        disposedTimerDispatcher.current.initArea('AdcContext');

        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            disposedTimerDispatcher.current.clearArea('AdcContext');
        }
    }, [disposedTimerDispatcher]);

    const channelList = useMemo<AdcChannelModel[]>(() => {
        return [
            { id: '453b87fb-8f2d-461f-bee9-239e2c7fbf17', pin: 0, description: 'Канал 0' },
            { id: '4ea8f075-1fc1-4b4a-a68f-30a47b9615d6', pin: 1, description: 'Канал 1' },
            { id: '6f9486da-2add-4157-a083-d46604d48e47', pin: 2, description: 'Канал 2' },
            { id: 'b25a5b95-cc68-4b35-ad9e-aa7fe6c9d2e7', pin: 3, description: 'Канал 3' },
            { id: 'c70c5d5b-adb2-47bb-8249-12ad89c42a95', pin: 4, description: 'Канал 4' },
            { id: 'a90a9023-004f-495b-97cd-c1a36e74dcf9', pin: 5, description: 'Канал 5' },
        ]
    }, []);

    const readingSettings = useMemo<AdcReadingSettingsModel>(() => {
        return {
            channel: 0,
            readContinuallyInterval: 1,
            fromTemperarureSensor: false,
        } as AdcReadingSettingsModel
    }, []);

    const readingResults = useMemo(() => {
        return {
            isStartedReading: false,
            timerUuid: null,
            consoleContent: ''
        } as AdcReadingResultsModel
    }, []);

    const writeMessage = useCallback((message: string) => {
        let curentText = readingResults.consoleContent ;
        curentText = `${curentText}${(curentText ? '\n' : '')}${message}`
        readingResults.consoleContent =  curentText;

        const textAreaElement = adcReadingResultsFormRef
            .current
            ?.instance
            .getEditor('consoleContent')
            ?.element()
            .querySelector('textarea') as HTMLTextAreaElement;

        if (textAreaElement) {
            textAreaElement.value = readingResults.consoleContent
            textAreaElement.scrollTop = textAreaElement.scrollHeight;
        }
    }, [readingResults]);

    const scrollBottom = useCallback(() => {
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

    const writeValueAsync = useCallback(async (mode: AdcReadModeModel) => {
        const startTime = performance.now();

        const value = mode === AdcReadModeModel.Adc
            ? await getAdcValueAsync(readingSettings.channel)
            : await getTemperatureValueAsync(readingSettings.channel);

        const endTime = performance.now();

        if (value && readingResults.isStartedReading) {
            writeMessage(`Канал ${value?.channel}: ${value?.value.toFixed(3)}${mode === AdcReadModeModel.Adc ? 'V' : '°C'}. Вычисление: ${(endTime - startTime) .toFixed(0)} мсек.`);
        }
    }, [readingSettings.channel, readingResults.isStartedReading, getAdcValueAsync, getTemperatureValueAsync, writeMessage]);


    const setTimer = useCallback(async () => {
        const disposedTimerUuid = getUuidV4();
        readingResults.timerUuid = disposedTimerUuid;

        const disposedTimerModel = {
            uuid: disposedTimerUuid,
            intervalTimer: null,
            timeoutTimerCancellationToken: false
        } as DisposedTimerModel;

        disposedTimerDispatcher.current.add('AdcContext', disposedTimerModel);

        const internalTimeoutTimer = async () => {
            await writeValueAsync(readingSettings.fromTemperarureSensor ? AdcReadModeModel.Temp : AdcReadModeModel.Adc);
            const startTime = performance.now();
            let endTime = startTime;

            const timer = setTimeout(() => {
                clearTimeout(timer);
                if (!disposedTimerModel.timeoutTimerCancellationToken) {
                    endTime = performance.now();
                    writeMessage(`Ожидание: ${(endTime - startTime).toFixed(0)} мсек.`);
                    internalTimeoutTimer();
                }
            }, 1000 * readingSettings.readContinuallyInterval);
        };

        await internalTimeoutTimer();

    }, [disposedTimerDispatcher, readingResults, readingSettings.fromTemperarureSensor, readingSettings.readContinuallyInterval, writeMessage, writeValueAsync]);

    const clearTimer = useCallback(() => {
        if(readingResults.timerUuid) {
            disposedTimerDispatcher.current.remove('AdcContext', readingResults.timerUuid);
            readingResults.timerUuid = null;
        }
    }, [readingResults, disposedTimerDispatcher]);

    useEffect(() => {
        tabPanelRef.current?.instance.on('selectionChanged', (e) => {
            console.log(e);
        });
    }, [tabPanelRef]);

    return (
        <AdcContext.Provider value={ {
            readingSettings,
            readingResults,

            channelList,
            adcReadingSettingsFormRef,
            adcReadingResultsFormRef,
            isShowOutputConsole,
            setIsShowOutputConsole,
            isReadingEnabled,
            setIsReadingEnabled,
            scrollBottom,
            writeValueAsync,
            setTimer,
            clearTimer
        } } { ...props }>

        </AdcContext.Provider>
    )
}

const useAdc = () => useContext(AdcContext);

export { AdcContextProvider, useAdc };
