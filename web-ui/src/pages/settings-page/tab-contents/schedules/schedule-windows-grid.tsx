import DataGrid, { Column, Editing } from 'devextreme-react/data-grid';
import { ValidationCallbackData, ValidationRule } from 'devextreme/common';
import { formatMessage } from 'devextreme/localization';
import { PageToolbar } from '../../../../components/page-toolbar/page-toolbar';
import { ScheduleModel, ScheduleWindowModel } from '../../../../models/regulator-settings/schelules-model';
import ArrayStore from 'devextreme/data/array_store';
import { useSettingPageContext } from '../../settings-page-context';
import { useCallback, useMemo, useRef } from 'react';
import { AddIcon, AdditionalMenuIcon, DeleteAllIcon } from '../../../../constants/app-icons';
import { useSchedulesContext } from './schedules-context';

export const ScheduleWindowsGrid = ({ schedule }: {schedule: ScheduleModel}) => {
    const { putSchedulesAsync } = useSchedulesContext();
    const scheduleWindowsRef = useRef<DataGrid<ScheduleWindowModel, any>>(null);
    const { regulatorSettings, setRegulatorSettings } = useSettingPageContext();

    const addScheduleWindowAsync = useCallback(async () => {
        if(scheduleWindowsRef && scheduleWindowsRef.current) {
            await scheduleWindowsRef.current?.instance.addRow();
        }
    }, []);

    const scheduleWindowsStore = useMemo( () => {
        return new ArrayStore<ScheduleWindowModel, string>({
        key: 'id',
        data: schedule.windows,
        onUpdated: async (key, values) => {
            await putSchedulesAsync(values);
        },

        onInserted: async (key, values) => {
            await putSchedulesAsync(values);
        }
    });
    }, [putSchedulesAsync, schedule.windows]);

    const scheduleWindowMenuItems = useMemo(() => {

        return [{
            icon: () => <AdditionalMenuIcon size={ 20 } color='black' />,
            items: [
                {
                    text: 'Добавить окно...',
                    icon: () => <AddIcon size={ 20 } />,
                    onClick: addScheduleWindowAsync
                },
                {
                    text: 'Удалить все окна...',
                    icon: () => <DeleteAllIcon size={ 20 } />,
                    onClick: async () => {
                        if (regulatorSettings) {
                            const currentSchedule = regulatorSettings?.regulatorParameters.schedules.items.find(i => i.day === schedule.day);
                            if (currentSchedule) {
                                currentSchedule.windows = [];
                                await putSchedulesAsync([]);

                                setRegulatorSettings({ ...regulatorSettings });
                            }
                        }
                    }
                }
            ]
        }]
    }, [addScheduleWindowAsync, putSchedulesAsync, regulatorSettings, schedule.day, setRegulatorSettings]);

    const timeValidationRules = useMemo<ValidationRule[]>(() => {
        return [
            {
                type: 'required',
                message: formatMessage('validation-required')
            },
            {
                type:'custom',
                validationCallback: (options: ValidationCallbackData) => {
                    console.log(options);

                    if (options.data.startTime && options.data.endTime)
                    {
                        return new Date(options.data.startTime) < new Date(options.data.endTime);
                    }

                    return true;
                },
                message: formatMessage('validation-compare')
            },
            {
                type:'custom',
                validationCallback: (options: ValidationCallbackData) => {
                    if (options.data.startTime) {
                        const currentSchedule = regulatorSettings?.regulatorParameters.schedules.items.find(i => i.day === schedule.day);

                        if(currentSchedule) {
                            return  !currentSchedule!.windows.filter(w => w.id !== options.data.id).some(w => {
                                const lowBound = new Date(options.data.startTime) >= new Date(w.startTime);
                                const upperBound = new Date(options.data.startTime) < new Date(w.endTime);

                                return lowBound && upperBound;
                            });
                        }
                    }

                    return true;
                },
                message: formatMessage('validation-range-overlapped')
            }

        ] as ValidationRule[]
    }, [regulatorSettings?.regulatorParameters.schedules.items, schedule.day]);

    return (
            <>
            <PageToolbar title='Временные окна' style={ { marginTop: 5, marginBottom: 5, marginRight: 5 } } menuItems={ scheduleWindowMenuItems }
            />
            <DataGrid
                ref={ scheduleWindowsRef }
                key={ 'id' }
                className='app-grid schedule-grid'
                dataSource={ scheduleWindowsStore }
                showColumnHeaders={ true }
                toolbar={ { visible: false } }>
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
                    dataType='number'
                    allowSorting={ false }
                    caption="Температура"
                    validationRules={ [{
                        type: 'required',
                        message: formatMessage('validation-required')
                    }] }
                />

                <Editing allowAdding allowUpdating allowDeleting mode='row' newRowPosition={ 'last' } />
            </DataGrid>
        </>
    );
}