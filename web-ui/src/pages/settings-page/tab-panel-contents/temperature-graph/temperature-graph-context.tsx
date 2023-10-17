import DataGrid from 'devextreme-react/data-grid';
import { RefObject, createContext, useContext, useRef } from 'react';
import { TemperatureGraphItemModel } from '../../../../models/regulator-settings/temperature-graph-model';

export type TempertureGraphContextModel = {
    dataGridRef: RefObject<DataGrid<TemperatureGraphItemModel, any>>
};

const TempertureGraphContext = createContext<TempertureGraphContextModel>({} as TempertureGraphContextModel)

function TemperatureGraphContextProvider(props: any) {
    const dataGridRef = useRef<DataGrid<TemperatureGraphItemModel>>(null);

    return (
        <TempertureGraphContext.Provider value={ {
            dataGridRef
        } } { ...props } />
    );
}

const useTemperatureGraphContext = () => useContext(TempertureGraphContext);

export { TemperatureGraphContextProvider, useTemperatureGraphContext };