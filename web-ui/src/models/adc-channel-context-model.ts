import Form from 'devextreme-react/form';
import { Dispatch } from 'react';
import { AdcReadModeModel } from './regulator-settings/enums/adc-read-mode';

export type AdcChannelModel = {
    id: string;
    pin: number;
    description: string
}

export type AdcFormDataModel = {
    channel: number;
    isReadContinually: boolean;
    readContinuallyInterval: number;
    timerUuid: string | null;
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
    showValueAsync: (mode: AdcReadModeModel) => Promise<void>;

    setTimer: () => void
    clearTimer: () => void;
};