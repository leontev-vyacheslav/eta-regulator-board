import Form from 'devextreme-react/form';
import { Dispatch } from 'react';
import { AdcReadModeModel } from './regulator-settings/enums/adc-read-mode';

export type AdcChannelModel = {
    id: string;
    pin: number;
    description: string
}

export type AdcReadingSettingsModel = {
    channel: number;
    readContinuallyInterval: number;
    fromTemperatureSensor: boolean;
}

export type AdcReadingResultsModel = {
    timerUuid: string | null;
    consoleContent: string;
    isStartedReading: boolean
}

export type AdcContextModel = {
    readingSettings: AdcReadingSettingsModel;
    readingResults: AdcReadingResultsModel;

    channelList: AdcChannelModel[];

    adcReadingSettingsFormRef: React.RefObject<Form>;
    adcReadingResultsFormRef: React.RefObject<Form>;

    isShowOutputConsole: boolean;
    setIsShowOutputConsole: Dispatch<React.SetStateAction<boolean>>;

    isReadingEnabled: boolean;
    setIsReadingEnabled: Dispatch<React.SetStateAction<boolean>>;

    scrollBottom: () => void;
    writeValueAsync: (mode: AdcReadModeModel) => Promise<void>;

    setTimer: () => void
    clearTimer: () => void;
};