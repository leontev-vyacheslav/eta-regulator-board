import Form from 'devextreme-react/form';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AdcReadModeModel } from '../../../../models/regulator-settings/enums/adc-read-mode';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { useDebugPage } from '../../debug-page-context';
import { useSharedArea } from '../../../../contexts/shared-area';
import { getUuidV4 } from '../../../../utils/uuid';
import { AdcChannelModel, AdcContextModel, AdcReadingResultsModel, AdcReadingSettingsModel } from '../../../../models/adc-channel-context-model';
import { DisposedTimerModel } from '../../../../models/disposed-timer-storage-model';


const AdcContext = createContext({} as AdcContextModel);

function AdcContextProvider(props: any) {
    const { modeId } = useDebugPage();
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
        return modeId === 1 ?
            [
                { id: '981d6639-06fb-425f-9895-5eaa9c03683b', pin: 0, description: 'Температура наружного воздуха' },
                { id: '2dedb607-bfbe-4963-a91e-6930f4f16ba9', pin: 1, description: 'Температура в помещении' },
                { id: '4627273a-ba41-4a4e-a0b8-0f24b7cdfbb1', pin: 2, description: 'Температура подачи контура №1' },
                { id: 'fe93836a-e3d7-492a-bd1c-eb7e66fc6767', pin: 3, description: 'Температура обратки контура №1' },
                { id: 'e8879aed-3b2a-4097-b500-390072957f2e', pin: 4, description: 'Температура подачи контура №2' },
                { id: 'aaff00fb-d900-4cb9-996f-12ee42efd7f6', pin: 5, description: 'Температура обратки контура №2' },
            ]
            : [
                { id: '4b8efd8c-df05-4be3-9baf-dac258204d0d', pin: 0, description: 'Канал 0' },
                { id: '860b6504-ec9b-4bda-ac14-dc889bf8ca1f', pin: 1, description: 'Канал 1' },
                { id: '02e34e16-d0ce-4161-90f9-95bf3988acc2', pin: 2, description: 'Канал 2' },
                { id: '9160e035-2560-4ce5-919c-8fb86eba6b6a', pin: 3, description: 'Канал 3' },
                { id: '2f513445-e7ff-4fdc-8b4a-06dc3fd2021f', pin: 4, description: 'Канал 4' },
                { id: '8ba0e486-710d-4d21-a9f8-5bf3a8a92c06', pin: 5, description: 'Канал 5' },
            ]
    }, [modeId]);

    const readingSettings = useMemo<AdcReadingSettingsModel>(() => {
        return {
            channel: 0,
            readContinuallyInterval: 1,
            fromTemperatureSensor: false,
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
            await writeValueAsync(readingSettings.fromTemperatureSensor ? AdcReadModeModel.Temp : AdcReadModeModel.Adc);
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

    }, [disposedTimerDispatcher, readingResults, readingSettings.fromTemperatureSensor, readingSettings.readContinuallyInterval, writeMessage, writeValueAsync]);

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
