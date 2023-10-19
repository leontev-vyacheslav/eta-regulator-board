import DataGrid from 'devextreme-react/data-grid';
import { RefObject, createContext, useContext, useMemo, useRef } from 'react';
import { TemperatureGraphItemModel } from '../../../../models/regulator-settings/temperature-graph-model';
import { ScheduleModel } from '../../../../models/regulator-settings/schelules-model';

export type SchedulesContextModel = {
    dataGridRef: RefObject<DataGrid<ScheduleModel, any>>,

    daysOfWeek: string[]
};

const SchedulesContext = createContext<SchedulesContextModel>({} as SchedulesContextModel)

function SchedulesContextProvider(props: any) {
    const dataGridRef = useRef<DataGrid<TemperatureGraphItemModel>>(null);

    const daysOfWeek = useMemo<string[]>( () =>
        [
            'Понедельник',
            'Вторник',
            'Среда',
            'Четверг',
            'Пятница',
            'Суббота',
            'Воскресенье']
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