import DataGrid from 'devextreme-react/data-grid';
import { RefObject, createContext, useContext, useMemo, useRef } from 'react';
import { TemperatureGraphItemModel } from '../../../../models/regulator-settings/temperature-graph-model';
import { ScheduleModel } from '../../../../models/regulator-settings/schelules-model';

export type SchedulesContextModel = {
    dataGridRef: RefObject<DataGrid<ScheduleModel, any>>,

    daysOfWeek: {id: number, name: string}[]
};

const SchedulesContext = createContext<SchedulesContextModel>({} as SchedulesContextModel)

function SchedulesContextProvider(props: any) {
    const dataGridRef = useRef<DataGrid<TemperatureGraphItemModel>>(null);

    const daysOfWeek = useMemo<{id: number, name: string}[]>( () =>
        [
            { id: 1, name: 'Понедельник' },
            { id: 2, name: 'Вторник' },
            { id: 3, name: 'Среда' },
            { id: 4, name: 'Четверг' },
            { id: 5, name: 'Пятница' },
            { id: 6, name: 'Суббота' },
            { id: 7, name: 'Воскресенье' }
        ]
    , []);

    return (
        <SchedulesContext.Provider value={ {
            dataGridRef,
            daysOfWeek
        } } { ...props } />
    );
}

const useSchedulesContext = () => useContext(SchedulesContext);

export { SchedulesContextProvider, useSchedulesContext };