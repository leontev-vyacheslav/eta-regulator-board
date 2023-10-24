import DataGrid, { Column, Editing, Selection } from 'devextreme-react/data-grid'
import { useSettingPageContext } from '../../settings-page-context';
import { useScreenSize } from '../../../../utils/media-query';
import { useEffect, useMemo, useState, useRef } from 'react';
import ArrayStore from 'devextreme/data/array_store';
import { TemperatureGraphItemModel } from '../../../../models/regulator-settings/temperature-graph-model';
import { ValidationCallbackData, ValidationRule } from 'devextreme/common';
import { formatMessage } from 'devextreme/localization';
import { PageToolbar } from '../../../../components/page-toolbar/page-toolbar';
import { AddIcon, AdditionalMenuIcon, DeleteAllIcon } from '../../../../constants/app-icons';
import { useTemperatureGraphContext } from './temperature-graph-context';
import { showConfirmDialog } from '../../../../utils/dialogs';

export const TemperatureGraphGrid = () => {
    const { regulatorSettings, setRegulatorSettings } = useSettingPageContext();
    const { putTemparatureGraphAsync } = useTemperatureGraphContext();
    const { isXSmall, isSmall } = useScreenSize();

    const dataGridRef = useRef<DataGrid<TemperatureGraphItemModel>>(null);

    const temperatureGraphStore = useMemo(() => {
        const store = new ArrayStore({
            key: 'id',
            data: regulatorSettings?.regulatorParameters.temperatureGraph.items,

            onInserted: async (values: TemperatureGraphItemModel) => {
                await putTemparatureGraphAsync(values);
            },

            onUpdated: async (values: TemperatureGraphItemModel) => {
                await putTemparatureGraphAsync(values);
            },

            onRemoving: async (key: any) => {
                const removingItem = regulatorSettings?.regulatorParameters.temperatureGraph.items.find(i => i.id === key);

                if (removingItem) {
                    (store as any).lastRemovingItem = removingItem;
                }
            },

            onRemoved: async (key: any) => {
                const removingItem = (store as any).lastRemovingItem;

                if (removingItem && removingItem.id === key) {
                    await putTemparatureGraphAsync(removingItem);
                    delete (store as any).lastRemovingItem;
                }
            }
        });

        return store;
    }, [putTemparatureGraphAsync, regulatorSettings?.regulatorParameters.temperatureGraph.items]);

    const defaultColumCaptions = useMemo(() => {
        return {
            outdoorTemperatureColCaption: isXSmall ? 'Tвн, °C' : 'Внеш. темп. (°C)',
            supplyPipeTemperatureColCaption: isXSmall ? 'Тп, °C' : 'Темп. подачи (°C)',
            returnPipeTemperature: isXSmall ? 'То, °C' : 'Темп. обратки (°C)',
        };
    }, [isXSmall]);

    const [сolumCaptions, setColumCaptions] = useState(defaultColumCaptions);

    const menuItems = useMemo(() => {
        return [{
            icon: () => <AdditionalMenuIcon size={ 20 } color='black' />,
            items: [
                {
                    text: formatMessage('menu-item-add-point'),
                    icon: () => <AddIcon size={ 20 } />,
                    onClick: async () =>  {
                        if(dataGridRef && dataGridRef.current) {
                            await dataGridRef.current?.instance.addRow();
                        }
                    }
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
                                    regulatorSettings.regulatorParameters.temperatureGraph.items = [];
                                    await putTemparatureGraphAsync({} as TemperatureGraphItemModel)

                                    setRegulatorSettings({ ...regulatorSettings });
                                },
                                textRender: () => {
                                    return <> { formatMessage('confirm-dialog-delete-all-points') } </>;
                                }
                            });
                        }
                    }
                }
            ]
        }];
    }, [putTemparatureGraphAsync, regulatorSettings, setRegulatorSettings])

    useEffect(() => {
        setColumCaptions(defaultColumCaptions);
    }, [defaultColumCaptions]);

    const outdoorTemperatureValidationRules = useMemo<ValidationRule[]>(() => {
        return [
            {
                type: 'required',
                message: formatMessage('validation-required')
            },
            {
                type: 'range',
                min: -35,
                max: 25,
                message: formatMessage('validation-range-formatted-with-values', '-35°C', '25°C')
            },
            {
                type: 'numeric',
            },
            {
                type: 'custom',
                validationCallback: (options: ValidationCallbackData) => {
                    const items = temperatureGraphStore.createQuery().toArray();
                    const existedValue = items.find(t => t.outdoorTemperature === options.value && t.id !== options.data.id);

                    return !existedValue;
                },
                message: formatMessage('validation-value-already-existed')
            }] as ValidationRule[]
    }, [temperatureGraphStore]);

    const supplyPipeTemperatureValidationRules = useMemo<ValidationRule[]>(() => [
        {
            type: 'required',
            message: formatMessage('validation-required')
        },
        {
            type: 'numeric'
        },
        {
            type: 'range',
            min: 35,
            max: 120,
            message: formatMessage('validation-range-formatted-with-values', '35°C', '120°C')
        },
        {
            type: 'custom',
            validationCallback: (options: ValidationCallbackData) => {

                return !options.data.returnPipeTemperature || options.data.returnPipeTemperature < options.value;
            },
            message: formatMessage('validation-compare-supply-temperature-return-temperature')
        }
    ], [])

    const returnPipeTemperatureValidationRules = useMemo<ValidationRule[]>(() => [
        {
            type: 'required',
            message: formatMessage('validation-required')
        },
        {
            type: 'numeric'
        },
        {
            type: 'range',
            min: 20,
            max: 80,
            message: formatMessage('validation-range-formatted-with-values', '20°C', '80°C')
        },
        {
            type: 'custom',
            validationCallback: (options: ValidationCallbackData) => {

                return !options.data.supplyPipeTemperature || options.data.supplyPipeTemperature > options.value;
            },
            message: formatMessage('validation-compare-supply-temperature-return-temperature')
        }
    ], []);

    return (
        <>
            <PageToolbar title={ formatMessage('temperature-graph-title') } menuItems={ menuItems } style={ { width: isXSmall || isSmall ? '100%' : 600 } } />
            <DataGrid
                ref={ dataGridRef }
                className='app-grid temperagure-graph-grid'
                showColumnLines
                width={ isXSmall || isSmall ? '100%' : 600 }
                dataSource={ temperatureGraphStore }
                height={ '50vh' }
            >
                <Selection mode='single' />

                <Column
                    dataType='string'
                    dataField='outdoorTemperature'
                    caption={ сolumCaptions.outdoorTemperatureColCaption }
                    allowSorting={ true }
                    sortOrder='asc'
                    validationRules={ outdoorTemperatureValidationRules }
                    editorOptions={ { mask: '#00' } }
                />

                <Column
                     dataType='number'
                    dataField='supplyPipeTemperature'
                    caption={ сolumCaptions.supplyPipeTemperatureColCaption }
                    allowSorting={ false }
                    validationRules={ supplyPipeTemperatureValidationRules }
                />

                <Column
                     dataType='number'
                    dataField='returnPipeTemperature'
                    caption={ сolumCaptions.returnPipeTemperature }
                    allowSorting={ false }
                    validationRules={ returnPipeTemperatureValidationRules }
                />

                <Editing mode='row' allowUpdating allowDeleting />
            </DataGrid>
        </>
    )
}