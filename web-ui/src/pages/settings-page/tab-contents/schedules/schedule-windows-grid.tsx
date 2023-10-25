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
import { useScreenSize } from '../../../../utils/media-query';
import { showConfirmDialog } from '../../../../utils/dialogs';

export const ScheduleWindowsGrid = ({ schedule }: {schedule: ScheduleModel}) => {
    const { putSchedulesAsync } = useSchedulesContext();
    const scheduleWindowsRef = useRef<DataGrid<ScheduleWindowModel, any>>(null);
    const { regulatorSettings, setRegulatorSettings } = useSettingPageContext();
    const { isXSmall } = useScreenSize();

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
            await putSchedulesAsync([values]);
        },

        onRemoved: async () => {
            await putSchedulesAsync([]);
        }
    });
    }, [putSchedulesAsync, schedule.windows]);

    const scheduleWindowMenuItems = useMemo(() => {

        return [{
            icon: () => <AdditionalMenuIcon size={ 20 } color='black' />,
            items: [
                {
                    text: formatMessage('menu-item-add-schedule-window'),
                    icon: () => <AddIcon size={ 20 } />,
                    onClick: addScheduleWindowAsync
                },
                {
                    text: formatMessage('menu-item-delete-all-schedule-windows'),
                    icon: () => <DeleteAllIcon size={ 20 } />,
                    onClick: async () => {

                        if (regulatorSettings) {
                            const currentSchedule = regulatorSettings?.regulatorParameters.schedules.items.find(i => i.day === schedule.day);
                            if (currentSchedule) {
                                showConfirmDialog({
                                    title: formatMessage('confirm-title'),
                                    iconName: 'DeleteAllIcon',
                                    iconSize: 32,
                                    callback: async () => {
                                        currentSchedule.windows = [];
                                        await putSchedulesAsync([]);
                                        setRegulatorSettings({ ...regulatorSettings });
                                    },
                                    textRender: () => {
                                        return <> { formatMessage('confirm-dialog-delete-all-schedule-windows') } </>;
                                    }
                                });
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
                    if (options.column.dataField === 'startTime' && options.data.startTime) {
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
            <PageToolbar title={ formatMessage('schedule-windows-title') } style={ { marginRight: -8 } } menuItems={ scheduleWindowMenuItems }
            />
            <DataGrid
                ref={ scheduleWindowsRef }
                key={ 'id' }
                className='app-grid schedule-windows-grid'
                dataSource={ scheduleWindowsStore }
                showColumnHeaders={ !isXSmall }
                toolbar={ { visible: false } }>
                <Column
                    dataField={ 'startTime' }
                    cssClass='schedule-time-picker'
                    dataType='datetime'
                    editorOptions={  { type: 'time', pickerType: 'rollers', showDropDownButton: false } }
                    caption="Начало"
                    allowSorting={ false }
                    sortOrder={ 'asc' }
                    format={ 'shortTime' }
                    validationRules={ timeValidationRules }
                />
                <Column
                    dataField={ 'endTime' }
                    cssClass='schedule-time-picker'
                    dataType='datetime'
                    editorOptions={ { type: 'time', pickerType: 'rollers', showDropDownButton: false,  } }
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
                    },
                {
                    type: 'range',
                    min: 15,
                    max: 25
                }] }
                />

                <Editing allowAdding allowUpdating allowDeleting mode='row' newRowPosition={ 'last' } />
            </DataGrid>
        </>
    );
}