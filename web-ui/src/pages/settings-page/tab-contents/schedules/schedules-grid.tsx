import './schedules.scss';

import { DataGrid, Column, MasterDetail, Editing, Lookup } from 'devextreme-react/data-grid'
import { useSchedulesContext } from './schedules-context'
import { useSettingPageContext } from '../../settings-page-context';
import DataGridIconCellValueContainer from '../../../../components/data-grid-utils/data-grid-icon-cell-value-container';
import { AddIcon, AdditionalMenuIcon, DayOfWeekIcon, DeleteAllIcon, RefreshIcon } from '../../../../constants/app-icons';
import {  useCallback, useMemo, useRef } from 'react';
import ArrayStore from 'devextreme/data/array_store';
import { ScheduleModel } from '../../../../models/regulator-settings/schelules-model';
import { ValidationCallbackData, ValidationRule } from 'devextreme/common';
import { formatMessage } from 'devextreme/localization';
import { ScheduleWindowsGrid } from './schedule-windows-grid';
import { PageToolbar } from '../../../../components/page-toolbar/page-toolbar';
import { useScreenSize } from '../../../../utils/media-query';
import { showConfirmDialog } from '../../../../utils/dialogs';
import { useParams } from 'react-router-dom';


export const SchedulesGrid = () => {
    const { circuitId } = useParams();

    const schedulesDataGridRef = useRef<DataGrid<ScheduleModel, any>>(null)
    const { daysOfWeek, putSchedulesAsync } = useSchedulesContext();
    const { regulatorSettings, setRegulatorSettings, refreshRegulatorSettingsAsync } = useSettingPageContext();
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
                    const existedDays = regulatorSettings?.heatingCircuits.items[circuitId ? parseInt(circuitId): 0].regulatorParameters.schedules.items.map(i => i.day);

                    return !existedDays?.find(d => d === options.data.day);
                },
                message:  formatMessage('validation-value-already-existed')
            }
        ];
    }, [circuitId, regulatorSettings?.heatingCircuits.items]);

    const schedulesStore = useMemo(() => {

        return new ArrayStore({
            key: 'id',
            data: regulatorSettings?.heatingCircuits.items[circuitId ? parseInt(circuitId): 0].regulatorParameters.schedules.items,
            onRemoved: async (values: ScheduleModel) => {
                await putSchedulesAsync(values);
            },

            onInserted: async (values: ScheduleModel) => {
                const item = regulatorSettings?.heatingCircuits.items[circuitId ? parseInt(circuitId): 0].regulatorParameters.schedules.items.find(i => i.id === values.id);
                if (item) {
                    item.windows = []
                }
                await putSchedulesAsync(values);
            },
        });
    }, [circuitId, putSchedulesAsync, regulatorSettings?.heatingCircuits.items]);

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
                    text: 'Обновить...',
                    icon: () => <RefreshIcon size={ 20 } />,
                    onClick: refreshRegulatorSettingsAsync
                },
                {
                    text: 'Добавить день',
                    icon: () => <AddIcon size={ 20 } />,
                    onClick: addScheduleAsync
                },
                {
                     text: formatMessage('menu-item-delete-all-schedules'),
                    icon: () => <DeleteAllIcon size={ 20 } />,
                     onClick: async () => {
                         if (!regulatorSettings || regulatorSettings.heatingCircuits.items[0].regulatorParameters.schedules.items.length === 0) {
                            return;
                         }

                         showConfirmDialog({
                            title: formatMessage('confirm-title'),

                            iconName: 'DeleteAllIcon',
                            iconSize: 32,
                            callback: async () => {
                                regulatorSettings.heatingCircuits.items[0].regulatorParameters.schedules.items = [];
                                await putSchedulesAsync([]);

                                setRegulatorSettings({ ...regulatorSettings });
                            },
                            textRender: () => {
                                return <> { formatMessage('confirm-dialog-delete-all-schedules') } </>;
                            }
                        });
                    }
                }
            ]
        }];
    }, [addScheduleAsync, putSchedulesAsync, refreshRegulatorSettingsAsync, regulatorSettings, setRegulatorSettings])

    return (
        <>
            <PageToolbar title={ formatMessage('schedules-title') } menuItems={ menuItems } style={ { width:  isXSmall || isSmall ? '100%' : 600 } } />
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
        </>
    )
}