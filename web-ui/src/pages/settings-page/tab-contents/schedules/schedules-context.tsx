import DataGrid from 'devextreme-react/data-grid';
import { RefObject, createContext, useContext, useRef } from 'react';
import { TemperatureGraphItemModel } from '../../../../models/regulator-settings/temperature-graph-model';
import { ScheduleModel } from '../../../../models/regulator-settings/schelules-model';

export type SchedulesContextModel = {
    dataGridRef: RefObject<DataGrid<ScheduleModel, any>>
};

const SchedulesContext = createContext<SchedulesContextModel>({} as SchedulesContextModel)

function SchedulesContextProvider(props: any) {
    const dataGridRef = useRef<DataGrid<TemperatureGraphItemModel>>(null);

    return (
        <SchedulesContext.Provider value={ {
            dataGridRef
        } } { ...props } />
    );
}

const useSchedulesContext = () => useContext(SchedulesContext);

export { SchedulesContextProvider, useSchedulesContext };