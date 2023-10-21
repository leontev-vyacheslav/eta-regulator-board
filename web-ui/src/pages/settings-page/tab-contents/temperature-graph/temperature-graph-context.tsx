import { createContext, useCallback, useContext } from 'react'
import { TemperatureGraphItemModel } from '../../../../models/regulator-settings/temperature-graph-model';
import { useSettingPageContext } from '../../settings-page-context';
import { useAppData } from '../../../../contexts/app-data/app-data';

export type TemperatureGraphContextModel = {
    putTemparatureGraphAsync: (values: TemperatureGraphItemModel) => Promise<void>;
};


const TemperatureGraphContext = createContext({} as TemperatureGraphContextModel);

function TempregatureGraphProvider(props: any) {
    const { regulatorSettings } = useSettingPageContext();
    const { putRegulatorSettingsAsync } = useAppData();

    const putTemparatureGraphAsync = useCallback(async (values: TemperatureGraphItemModel) => {

        const regulatorSettingsChange = {
            regulatorSettings: regulatorSettings!,
            changeLogItem: {
                dataField: Object.keys(values).join(', '),
                datetime: new Date(),
                path: 'regulatorSettings.regulatorParameters.temperatureGraph.items',
                value: Object.values(values).join(', ')
            }
        }

        await putRegulatorSettingsAsync(regulatorSettingsChange);
    }, [putRegulatorSettingsAsync, regulatorSettings]);

    return (
        <TemperatureGraphContext.Provider value={ {
            putTemparatureGraphAsync
        } } { ...props } />
    )
}

const useTemperatureGraphContext = () => useContext(TemperatureGraphContext);

export { TempregatureGraphProvider, useTemperatureGraphContext };