import './schedules.scss';
import { SchedulesContextProvider, useSchedulesContext } from './schedules-context'
import { SchedulesGrid } from './schedules-grid'
import { useCallback, useMemo } from 'react';
import { AddIcon, AdditionalMenuIcon, DeleteAllIcon, RefreshIcon } from '../../../../constants/app-icons';
import { ScheduleModel } from '../../../../models/regulator-settings/schedules-model';
import ArrayStore from 'devextreme/data/array_store';
import { showConfirmDialog } from '../../../../utils/dialogs';
import { formatMessage } from 'devextreme/localization';
import { PageToolbar } from '../../../../components/page-toolbar/page-toolbar';
import { useSettingPageContext } from '../../settings-page-context';

const SchedulesTabContentInner = () => {
    const { regulatorSettings, setRegulatorSettings, refreshRegulatorSettingsAsync, circuitId } = useSettingPageContext();
    const { putSchedulesAsync, schedulesDataGridRef } = useSchedulesContext();

    const schedulesStore = useMemo(() => {

        return new ArrayStore({
            key: 'id',
            data: regulatorSettings?.heatingCircuits.items[circuitId].regulatorParameters.schedules.items,
            onRemoved: async (values: ScheduleModel) => {
                await putSchedulesAsync(values);
            },

            onInserted: async (values: ScheduleModel) => {
                const item = regulatorSettings?.heatingCircuits.items[circuitId ].regulatorParameters.schedules.items.find(i => i.id === values.id);
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
        <div className='setting-form'>
            <PageToolbar title={ formatMessage('schedules-title') } menuItems={ menuItems } />
            <SchedulesGrid dataSource={ schedulesStore } />
        </div>
    );
}


export const SchedulesTabContent = () => {
    return (
        <SchedulesContextProvider>
            <SchedulesTabContentInner />
        </SchedulesContextProvider>
    );
}