import { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import { useAppData } from '../../../../contexts/app-data/app-data';
import DataGrid from 'devextreme-react/data-grid';
import { ScheduleModel } from '../../../../models/regulator-settings/schedules-model';
import { useRegulatorSettings } from '../../../../contexts/app-regulator-settings';

export type SchedulesContextModel = {

    daysOfWeek: {id: number, name: string}[];

    putSchedulesAsync: (values: any) => Promise<void> | void;

    schedulesDataGridRef: React.RefObject<DataGrid<ScheduleModel, any>>
};

const SchedulesContext = createContext<SchedulesContextModel>({} as SchedulesContextModel)

function SchedulesContextProvider(props: any) {
    const { putRegulatorSettingsAsync } = useAppData();
    const { regulatorSettings } = useRegulatorSettings();
    const schedulesDataGridRef = useRef<DataGrid<ScheduleModel, any>>(null)

    const putSchedulesAsync = useCallback(async () => {
        await putRegulatorSettingsAsync(regulatorSettings!);
    }, [putRegulatorSettingsAsync, regulatorSettings]);

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
            daysOfWeek,
            putSchedulesAsync,
            schedulesDataGridRef
        } } { ...props } />
    );
}

const useSchedulesContext = () => useContext(SchedulesContext);

export { SchedulesContextProvider, useSchedulesContext };