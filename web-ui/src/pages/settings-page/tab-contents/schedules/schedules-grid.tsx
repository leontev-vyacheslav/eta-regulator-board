import { DataGrid, Column, MasterDetail, Editing, Lookup } from 'devextreme-react/data-grid'
import { useSchedulesContext } from './schedules-context'
import { useSettingPageContext } from '../../settings-page-context';
import DataGridIconCellValueContainer from '../../../../components/data-grid-utils/data-grid-icon-cell-value-container';
import { AddIcon, AdditionalMenuIcon, DayOfWeekIcon } from '../../../../constants/app-icons';
import {  useCallback, useMemo, useRef } from 'react';
import ArrayStore from 'devextreme/data/array_store';
import { ScheduleModel } from '../../../../models/regulator-settings/schelules-model';
import { ValidationCallbackData, ValidationRule } from 'devextreme/common';
import { formatMessage } from 'devextreme/localization';
import { ScheduleWindowsGrid } from './schedule-windows-grid';
import { PageToolbar } from '../../../../components/page-toolbar/page-toolbar';
import { useScreenSize } from '../../../../utils/media-query';


export const SchedulesGrid = () => {
    const schedulesDataGridRef = useRef<DataGrid<ScheduleModel, any>>(null)
    const { daysOfWeek, putSchedulesAsync } = useSchedulesContext();
    const { regulatorSettings } = useSettingPageContext();
    const { isXSmall, isSmall } = useScreenSize();

    const dayOfWeekValidationRules = useMemo<ValidationRule[]>(() => {
        return [
            {
                type: 'required',
                message: formatMessage('validation-required')
            },
            {
                type: 'custom',
                validationCallback: (options: ValidationCallbackData) =>
                {
                    const existedDays = regulatorSettings?.regulatorParameters.schedules.items.map(i => i.day);

                    return !existedDays?.find(d => d === options.data.day);
                },
                message:  formatMessage('validation-value-already-existed')
            }
        ];
    }, [regulatorSettings?.regulatorParameters.schedules.items]);

    const schedulesStore = useMemo(() => {

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

    const addScheduleAsync = useCallback(async () => {
        if(schedulesDataGridRef && schedulesDataGridRef.current) {
            await schedulesDataGridRef.current?.instance.addRow();
        }
    }, [schedulesDataGridRef]);

    const menuItems = useMemo(() => {
        return [{
            icon: () => <AdditionalMenuIcon size={ 20 } color='black' />,
            items: [
                {
                    text: 'Добавить день...',
                    icon: () => <AddIcon size={ 20 } />,
                    onClick: addScheduleAsync
                }
            ]
        }];
    }, [addScheduleAsync])

    return (
        <>
            <PageToolbar title={ 'Дни недели' } menuItems={ menuItems } style={ { width:  isXSmall || isSmall ? '100%' : 600 } } />
            <DataGrid
                className='app-grid schedules-grid'
                key={ 'id' }
                ref={ schedulesDataGridRef }
                dataSource={ schedulesStore }
                height={ '50vh' }
                showColumnHeaders={ false }
                toolbar={ { visible: false } }
                width={ isXSmall || isSmall ? '100%' : 600 }
            >
                <Column
                    dataType='number'
                    dataField={ 'day' }
                    caption='День недели'
                    sortOrder='asc'
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
                        } }
                    validationRules={ dayOfWeekValidationRules }
                    >
                    <Lookup
                        dataSource={ daysOfWeek }
                        valueExpr={ 'id' }
                        displayExpr={ 'name' }
                    />
                </Column>
                <Editing allowAdding allowDeleting mode='row' />

                <MasterDetail
                    enabled={ true }
                    render={ (e) => <ScheduleWindowsGrid schedule={ e.data } /> }
                />
            </DataGrid>
        </>
    )
}