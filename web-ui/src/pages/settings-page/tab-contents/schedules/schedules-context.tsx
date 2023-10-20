import DataGrid from 'devextreme-react/data-grid';
import { RefObject, createContext, useCallback, useContext, useMemo, useRef } from 'react';
import { ScheduleModel } from '../../../../models/regulator-settings/schelules-model';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { useSettingPageContext } from '../../settings-page-context';

export type SchedulesContextModel = {
    schedulesDataGridRef: RefObject<DataGrid<ScheduleModel, any>>;

    daysOfWeek: {id: number, name: string}[];

    putSchedulesAsync: (values: any) => Promise<void> | void;
};

const SchedulesContext = createContext<SchedulesContextModel>({} as SchedulesContextModel)

function SchedulesContextProvider(props: any) {
    const schedulesDataGridRef = useRef<DataGrid<ScheduleModel>>(null);
    const { putRegulatorSettingsAsync } = useAppData();
    const { regulatorSettings } = useSettingPageContext();

    const putSchedulesAsync = useCallback(async (values: any) => {

        const regulatorSettingsChange = {
            regulatorSettings: regulatorSettings!,
            changeLogItem: {
                dataField: Object.keys(values).join(', '),
                datetime: new Date(),
                path: 'regulatorSettings.regulatorParameters.schedules.items',
                value: Object.values(values).join(', ')
            }
        };

        await putRegulatorSettingsAsync(regulatorSettingsChange);
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
            schedulesDataGridRef,
            daysOfWeek,
            putSchedulesAsync
        } } { ...props } />
    );
}

const useSchedulesContext = () => useContext(SchedulesContext);

export { SchedulesContextProvider, useSchedulesContext };