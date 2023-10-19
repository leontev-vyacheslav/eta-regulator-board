import { DataGrid, Column, MasterDetail, Editing } from 'devextreme-react/data-grid'
import { useSchedulesContext } from './schedules-context'
import { useSettingPageContext } from '../../settings-page-context';
import DataGridIconCellValueContainer from '../../../../components/data-grid-utils/data-grid-icon-cell-value-container';
import { DayOfWeekIcon } from '../../../../constants/app-icons';
// import {  useMemo } from 'react';
import { ScheduleWindowModel } from '../../../../models/regulator-settings/schelules-model';
// import {  ValidationCallbackData, ValidationRule } from 'devextreme/common';

export const SchedulesGrid = () => {
    const { dataGridRef, daysOfWeek } = useSchedulesContext();
    const { regulatorSettings } = useSettingPageContext();

    // eslint-disable-next-line no-unused-vars
    // const formatNumberToTimeComponent = useCallback( (timePart: number) => {
    //     return timePart < 10 ? `0${timePart}` : `${timePart}`
    // }, []);

    // const timeValidationRule = useMemo<ValidationRule[]>(() => {
    //     return [
    //         {
    //             type: 'required',
    //             message: 'Обязательное значение'
    //         },
    //         {
    //             type: 'pattern',
    //             pattern:'^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$',
    //             message: 'Не соответствует шаблону ЧЧ:ММ'
    //         },
    //         {
    //             type:'custom',
    //             validationCallback: (options: ValidationCallbackData) => {
    //                 console.log(options);

    //                 // const value = options.value.split(':');
    //                 // const h = parseInt(value[0]);
    //                 // const m = parseInt(value[1]);

    //                 const currentScheduleWindow = regulatorSettings?.regulatorParameters.schedules.items.flatMap(w => w.windows).find(w => w.id === options.data.id);

    //                 if (currentScheduleWindow){
    //                     const start = currentScheduleWindow.startTime.hours * 60 + currentScheduleWindow.startTime.minutes;
    //                     const end = currentScheduleWindow.endTime.hours * 60 + currentScheduleWindow.endTime.minutes;

    //                     return start < end;
    //                 }

    //                 return true;
    //             },
    //             message: 'Начало периода должно быть меньше конца периода'
    //         }
    //     ] as ValidationRule[]
    // }, [regulatorSettings?.regulatorParameters.schedules.items]);

    return (
        <DataGrid
            className='app-grid schedules-grid'
            key={ 'id' }
            ref={ dataGridRef }
            dataSource={ regulatorSettings?.regulatorParameters.schedules.items }
            height={ '50vh' }
            showColumnHeaders={ false }
        >
            <Column
                dataField={ 'day' }
                caption='День недели'
                allowSorting={ false }
                cellRender={ (e) => {
                    return (
                        <DataGridIconCellValueContainer
                            cellDataFormatter={ () => daysOfWeek[e.data.day - 1] }
                            iconRenderer={ (iconProps) => <DayOfWeekIcon size={ 18 } { ...iconProps } /> }
                            rowStyle={ { textAlign: 'left' } }
                        />
                    );
            } }
            />

            <MasterDetail
                enabled={ true }
                render={ (e) => {

                    return (
                        <DataGrid
                            key={ 'id' }
                            className='app-grid schedule-grid'
                            dataSource={ e.data.windows.map((w: ScheduleWindowModel) => {
                                return {
                                    id: w.id, 
                                    startTime: new Date(0, 0, 1, w.startTime.hours, w.startTime.minutes),
                                    endTime: new Date(0, 0, 1, w.endTime.hours, w.endTime.minutes),
                                    desiredTemperature: w.desiredTemperature,
                                    now: new Date()
                                }
                            }) }
                            showColumnHeaders={ true }>
                            <Column dataField={ 'startTime' } dataType='datetime' editorOptions={ { type: 'time' } } caption="Начало" allowSorting={ false } sortOrder={ 'asc' } format={ 'shortTime' } />
                            <Column dataField={ 'endTime' } dataType='datetime' editorOptions={ { type: 'time' } } caption="Конец" allowSorting={ false }  format={ 'shortTime' } />
                            <Column dataField={ 'desiredTemperature' } allowSorting={ false } caption="Температура" />

                            <Editing allowAdding allowUpdating allowDeleting mode='row' />
                        </DataGrid>
                    );
                } }
            />
        </DataGrid>
    )
}