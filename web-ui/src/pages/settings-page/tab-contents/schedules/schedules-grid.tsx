import './schedules.scss';

import { DataGrid, Column, MasterDetail, Editing, Lookup } from 'devextreme-react/data-grid'
import { useSettingPageContext } from '../../settings-page-context';
import DataGridIconCellValueContainer from '../../../../components/data-grid-utils/data-grid-icon-cell-value-container';
import { DayOfWeekIcon } from '../../../../constants/app-icons';
import {  useMemo } from 'react';
import { ValidationCallbackData, ValidationRule } from 'devextreme/common';
import { formatMessage } from 'devextreme/localization';
import { ScheduleWindowsGrid } from './schedule-windows-grid';
import { useSchedulesContext } from './schedules-context';

import AppConstants from '../../../../constants/app-constants';


export const SchedulesGrid = ({ dataSource }: {dataSource: any}) => {
    const { regulatorSettings, circuitId } = useSettingPageContext();
    const { schedulesDataGridRef, daysOfWeek } = useSchedulesContext();

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
                    const existedDays = regulatorSettings?.heatingCircuits.items[circuitId].regulatorParameters.schedules.items.map(i => i.day);

                    return !existedDays?.find(d => d === options.data.day);
                },
                message:  formatMessage('validation-value-already-existed')
            }
        ];
    }, [circuitId, regulatorSettings?.heatingCircuits.items]);

    return (
            <DataGrid
                className='app-grid schedules-grid'
                key={ 'id' }
                ref={ schedulesDataGridRef }
                dataSource={ dataSource }
                height={ AppConstants.formHeight }
                showColumnHeaders={ false }
                toolbar={ { visible: false } }
            >
                <Column type='detailExpand' width={ 50 } />
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
                        key={ 'id' }

                    />
                </Column>
                <Editing allowAdding allowDeleting mode='row' />

                <MasterDetail
                    enabled={ true }
                    render={ (e) => <ScheduleWindowsGrid schedule={ e.data } /> }
                />
            </DataGrid>
    );
}