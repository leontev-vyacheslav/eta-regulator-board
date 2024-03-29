import { Dispatch, createContext, useCallback, useContext, useRef, useState } from 'react'
import { TemperatureGraphItemModel } from '../../../../models/regulator-settings/temperature-graph-model';
import { useAppData } from '../../../../contexts/app-data/app-data';
import DataGrid from 'devextreme-react/data-grid';
import { useRegulatorSettings } from '../../../../contexts/app-regulator-settings';

export type TemperatureGraphContextModel = {
    putTemperatureGraphAsync: (values: TemperatureGraphItemModel) => Promise<void>;

    chartArgumentAxisInverted: boolean;
    setChartArgumentAxisInverted: Dispatch<React.SetStateAction<boolean>>;
    dataGridRef: React.RefObject<DataGrid<TemperatureGraphItemModel, any>>;
};


const TemperatureGraphContext = createContext({} as TemperatureGraphContextModel);

function TemperatureGraphProvider(props: any) {
    const { regulatorSettings } = useRegulatorSettings();
    const { putRegulatorSettingsAsync } = useAppData();
    const [chartArgumentAxisInverted, setChartArgumentAxisInverted] = useState<boolean>(false);
    const dataGridRef = useRef<DataGrid<TemperatureGraphItemModel>>(null);

    const putTemperatureGraphAsync = useCallback(async () => {
        await putRegulatorSettingsAsync(regulatorSettings!);
    }, [putRegulatorSettingsAsync, regulatorSettings]);

    return (
        <TemperatureGraphContext.Provider value={ {
            putTemperatureGraphAsync,
            chartArgumentAxisInverted,
            setChartArgumentAxisInverted,
            dataGridRef
        } } { ...props } />
    );
}

const useTemperatureGraphContext = () => useContext(TemperatureGraphContext);

export { TemperatureGraphProvider, useTemperatureGraphContext };