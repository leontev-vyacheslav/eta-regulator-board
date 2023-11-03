import { Dispatch, createContext, useCallback, useContext, useRef, useState } from 'react'
import { TemperatureGraphItemModel } from '../../../../models/regulator-settings/temperature-graph-model';
import { useSettingPageContext } from '../../settings-page-context';
import { useAppData } from '../../../../contexts/app-data/app-data';
import DataGrid from 'devextreme-react/data-grid';

export type TemperatureGraphContextModel = {
    putTemparatureGraphAsync: (values: TemperatureGraphItemModel) => Promise<void>;

    chartArgumentAxisInverted: boolean;
    setChartArgumentAxisInverted: Dispatch<React.SetStateAction<boolean>>;
    dataGridRef: React.RefObject<DataGrid<TemperatureGraphItemModel, any>>;
};


const TemperatureGraphContext = createContext({} as TemperatureGraphContextModel);

function TempregatureGraphProvider(props: any) {
    const { regulatorSettings } = useSettingPageContext();
    const { putRegulatorSettingsAsync } = useAppData();
    const [chartArgumentAxisInverted, setChartArgumentAxisInverted] = useState<boolean>(false);
    const dataGridRef = useRef<DataGrid<TemperatureGraphItemModel>>(null);

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
            putTemparatureGraphAsync,
            chartArgumentAxisInverted,
            setChartArgumentAxisInverted,
            dataGridRef
        } } { ...props } />
    );
}

const useTemperatureGraphContext = () => useContext(TemperatureGraphContext);

export { TempregatureGraphProvider, useTemperatureGraphContext };