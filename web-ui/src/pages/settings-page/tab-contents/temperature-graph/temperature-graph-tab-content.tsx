import './temperature-graph-tab-content.scss';
import { useMemo, useState } from 'react';
import { TemperatureGraphProvider, useTemperatureGraphContext } from './temperature-graph-context';
import { AddIcon, AdditionalMenuIcon, AxisInvert2Icon, AxisInvertIcon, DeleteAllIcon, GraphIcon, RefreshIcon, TableIcon } from '../../../../constants/app-icons';
import { TemperatureGraphItemModel } from '../../../../models/regulator-settings/temperature-graph-model';
import { useScreenSize } from '../../../../utils/media-query';
import { useSettingPageContext } from '../../settings-page-context';
import ArrayStore from 'devextreme/data/array_store';
import { formatMessage } from 'devextreme/localization';
import { showConfirmDialog } from '../../../../utils/dialogs';
import { PageToolbar } from '../../../../components/page-toolbar/page-toolbar';
import { TemperatureGraphGrid } from './temperature-graph-grid';
import { TemperatureGraphChart } from './temperature-graph-chart';

const TemperatureGraphTabContentInner = () => {
    const { regulatorSettings, setRegulatorSettings, refreshRegulatorSettingsAsync, circuitId } = useSettingPageContext();
    const { putTemperatureGraphAsync, setChartArgumentAxisInverted, chartArgumentAxisInverted, dataGridRef } = useTemperatureGraphContext();
    const { isXSmall, isSmall } = useScreenSize();
    const [isShowGraph, setIsShowGraph] = useState<boolean>(false);

    const temperatureGraphStore = useMemo(() => {
        const store = new ArrayStore({
            key: 'id',
            data: regulatorSettings?.heatingCircuits.items[circuitId].regulatorParameters.temperatureGraph.items,

            onInserted: async (values: TemperatureGraphItemModel) => {
                await putTemperatureGraphAsync(values);
            },

            onUpdated: async (values: TemperatureGraphItemModel) => {
                await putTemperatureGraphAsync(values);
            },

            onRemoving: async (key: any) => {
                const removingItem = regulatorSettings?.heatingCircuits.items[circuitId].regulatorParameters.temperatureGraph.items.find(i => i.id === key);

                if (removingItem) {
                    (store as any).lastRemovingItem = removingItem;
                }
            },

            onRemoved: async (key: any) => {
                const removingItem = (store as any).lastRemovingItem;

                if (removingItem && removingItem.id === key) {
                    await putTemperatureGraphAsync(removingItem);
                    delete (store as any).lastRemovingItem;
                }
            }
        });

        return store;
    }, [circuitId, putTemperatureGraphAsync, regulatorSettings?.heatingCircuits.items]);

    const menuItems = useMemo(() => {
        return [
            {
                icon: () => chartArgumentAxisInverted ? <AxisInvertIcon size={ 20 } color='black' /> : <AxisInvert2Icon size={ 20 } color='black' />,
                visible: isShowGraph,
                onClick: () => {
                    setChartArgumentAxisInverted(previous => !previous);
                }
            },
            {
                icon: () => !isShowGraph ? <GraphIcon size={ 20 } color='black' /> : <TableIcon size={ 20 } color='black' />,
                onClick: () => {
                    setIsShowGraph(previous => !previous);
                }
            },
            {
                icon: () => <AdditionalMenuIcon size={ 20 } color='black' />,
                items: [
                    {
                        text: 'Обновить...',
                        icon: () => <RefreshIcon size={ 20 } />,
                        onClick: refreshRegulatorSettingsAsync
                    },
                    {
                        text: formatMessage('menu-item-add-point'),
                        icon: () => <AddIcon size={ 20 } />,
                        onClick: async () => {
                            if (dataGridRef && dataGridRef.current) {
                                await dataGridRef.current?.instance.addRow();
                            }
                        },
                        visible: !isShowGraph,
                    },
                    {
                        text: formatMessage('menu-item-delete-all-points'),
                        icon: () => <DeleteAllIcon size={ 20 } />,
                        onClick: async () => {
                            if (regulatorSettings) {
                                showConfirmDialog({
                                    title: formatMessage('confirm-title'),
                                    iconName: 'DeleteAllIcon',
                                    iconSize: 32,
                                    callback: async () => {
                                        regulatorSettings.heatingCircuits.items[0].regulatorParameters.temperatureGraph.items = [];
                                        await putTemperatureGraphAsync({} as TemperatureGraphItemModel)

                                        setRegulatorSettings({ ...regulatorSettings });
                                    },
                                    textRender: () => {
                                        return <> {formatMessage('confirm-dialog-delete-all-points')} </>;
                                    }
                                });
                            }
                        },
                        visible: !isShowGraph,
                    }
                ]
            }];
    }, [chartArgumentAxisInverted, dataGridRef, isShowGraph, putTemperatureGraphAsync, refreshRegulatorSettingsAsync, regulatorSettings, setChartArgumentAxisInverted, setRegulatorSettings])

    return (
        <div className='setting-form'>
            <PageToolbar title={ formatMessage('temperature-graph-title') } menuItems={ menuItems } style={ { width: isXSmall || isSmall ? '100%' : 600 } } />
            {
                !isShowGraph
                    ?
                    <TemperatureGraphGrid dataSource={ temperatureGraphStore } />
                    :
                    <TemperatureGraphChart dataSource={ temperatureGraphStore } />
            }
        </div>
    );
}

export const TemperatureGraphTabContent = () => {
    return (
        <TemperatureGraphProvider>
            <TemperatureGraphTabContentInner />
        </TemperatureGraphProvider>
    );
}
