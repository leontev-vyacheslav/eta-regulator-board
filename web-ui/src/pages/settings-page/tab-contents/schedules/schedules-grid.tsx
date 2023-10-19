import { DataGrid, Column, MasterDetail, Editing, Lookup } from 'devextreme-react/data-grid'
import { useSchedulesContext } from './schedules-context'
import { useSettingPageContext } from '../../settings-page-context';
import DataGridIconCellValueContainer from '../../../../components/data-grid-utils/data-grid-icon-cell-value-container';
import { DayOfWeekIcon } from '../../../../constants/app-icons';
import {  useCallback, useMemo } from 'react';
import ArrayStore from 'devextreme/data/array_store';
import { ScheduleModel, ScheduleWindowModel } from '../../../../models/regulator-settings/schelules-model';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { ValidationCallbackData, ValidationRule } from 'devextreme/common';

export const SchedulesGrid = () => {
    const { dataGridRef, daysOfWeek } = useSchedulesContext();
    const { regulatorSettings } = useSettingPageContext();
    const { putRegulatorSettingsAsync } = useAppData();

    const timeValidationRules = useMemo<ValidationRule[]>(() => {
        return [
            {
                type: 'required',
                message: 'Обязательное значение'
            },
            {
                type:'custom',
                validationCallback: (options: ValidationCallbackData) => {
                    console.log(options);
                    return new Date(options.data.startTime) < new Date(options.data.endTime);
                },
                message: 'Начало периода должно быть меньше конца периода'
            }
        ] as ValidationRule[]
    }, []);

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

    const scheduleStore = useMemo(() => {

        return new ArrayStore({
            key: 'id',
            data: regulatorSettings?.regulatorParameters.schedules.items,
            onRemoved: async (values: ScheduleModel) => {
                await putSchedulesAsync(values);
            },

            onInserted: async (values: ScheduleModel) => {
                const item = regulatorSettings?.regulatorParameters.schedules.items.find(i => i.id === values.id);
                if (item) {
                    item.windows = []
                }
                await putSchedulesAsync(values);
            },
        });
    }, [putSchedulesAsync, regulatorSettings?.regulatorParameters.schedules.items]);

    return (
        <DataGrid
            className='app-grid schedules-grid'
            key={ 'id' }
            ref={ dataGridRef }
            dataSource={ scheduleStore }
            height={ '50vh' }
            showColumnHeaders={ false }
            toolbar={ { visible: false } }
        >
            <Column
                dataType='number'
                dataField={ 'day' }
                caption='День недели'
                allowSorting={ false }
                editorOptions={ 'lookup' }
                cellRender={ (e) => {
                    return (
                        <DataGridIconCellValueContainer
                            cellDataFormatter={ () => daysOfWeek.find(d => d.id === e.data.day)!.name }
                            iconRenderer={ (iconProps) => <DayOfWeekIcon size={ 18 } { ...iconProps } /> }
                            rowStyle={ { textAlign: 'left' } }
                        />
                    );
            } } >
                <Lookup
                    dataSource={ daysOfWeek }
                    valueExpr={ 'id' }
                    displayExpr={ 'name' }
                />
            </Column>
            <Editing allowAdding allowDeleting mode='row' />

            <MasterDetail
                enabled={ true }
                render={ (e) => {

                    const store = new ArrayStore<ScheduleWindowModel, string>({
                        key: 'id',
                        data: e.data.windows,
                        onUpdated: async (key, values) => {
                            await putSchedulesAsync(values);
                        },

                        onInserted: async (key, values) => {
                            await putSchedulesAsync(values);
                        }
                    });

                    return (
                        <DataGrid
                            key={ 'id' }
                            className='app-grid schedule-grid'
                            dataSource={ store }
                            showColumnHeaders={ true }>
                            <Column
                                dataField={ 'startTime' }
                                dataType='datetime'
                                editorOptions={ { type: 'time' } }
                                caption="Начало"
                                allowSorting={ false }
                                sortOrder={ 'asc' }
                                format={ 'shortTime' }
                                validationRules={ timeValidationRules }
                            />
                            <Column
                                dataField={ 'endTime' }
                                dataType='datetime'
                                editorOptions={ { type: 'time' } }
                                caption="Конец" allowSorting={ false }
                                format={ 'shortTime' }
                                validationRules={ timeValidationRules }
                            />
                            <Column
                                dataField={ 'desiredTemperature' }
                                allowSorting={ false }
                                caption="Температура"
                                validationRules={ [{
                                    type: 'required',
                                    message: 'Обязательное значение'
                                }] }
                            />

                            <Editing allowAdding allowUpdating allowDeleting mode='row' newRowPosition={ 'last' } />
                        </DataGrid>
                    );
                } }
            />
        </DataGrid>
    )
}