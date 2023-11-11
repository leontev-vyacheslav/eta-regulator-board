import './adc-tab-content.scss'
import 'devextreme-react/text-area';
import { AdcContextProvider, useAdc } from './adc-context';
import { AdcReadingResultsForm } from './adc-reading-results-form';
import { AdcReadingSettingsForm } from './adc-reading-settings-form';

const AdcTabContentInternal = () => {
    const { isShowOutputConsole } = useAdc();

    return (isShowOutputConsole
        ?
        <AdcReadingResultsForm />
        :
        < AdcReadingSettingsForm />
    );
}

export const AdcTabContent = () => {
    return (
        <AdcContextProvider>
            <AdcTabContentInternal />
        </AdcContextProvider>
    );
}