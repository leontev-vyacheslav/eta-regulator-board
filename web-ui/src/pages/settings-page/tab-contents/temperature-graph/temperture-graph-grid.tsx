import DataGrid, { Column, Editing, Selection } from 'devextreme-react/data-grid'
import { useSettingPageContext } from '../../settings-page-context';
import { useScreenSize } from '../../../../utils/media-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ArrayStore from 'devextreme/data/array_store';
import { TemperatureGraphItemModel } from '../../../../models/regulator-settings/temperature-graph-model';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { useTemperatureGraphContext } from './temperature-graph-context';
import { ValidationCallbackData, ValidationRule } from 'devextreme/common';

export const TemperatureGraphGrid = () => {
    const { regulatorSettings } = useSettingPageContext();
    const { isXSmall, isSmall } = useScreenSize();
    const { putRegulatorSettingsAsync } = useAppData();
    const { dataGridRef } = useTemperatureGraphContext();

    const putTemparatureGraphAsync = useCallback(async (values: TemperatureGraphItemModel) => {

        const regulatorSettingsChange = {
            regulatorSettings: regulatorSettings!,
            changeLogItem: {
                dataField: Object.keys(values).join(', '),
                datetime: new Date(),
                path: 'regulatorSettings.regulatorParameters.temperatureGraph.items',
                value: Object.values(values).join(', ')
            }
        }

        await putRegulatorSettingsAsync(regulatorSettingsChange);
    }, [putRegulatorSettingsAsync, regulatorSettings]);

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
            outdoorTemperatureColCaption: isXSmall ? 'Tвн. (°C)' : 'Внеш. темп. (°C)',
            supplyPipeTemperatureColCaption: isXSmall ? 'Тп (°C)' : 'Темп. подачи (°C)',
            returnPipeTemperature: isXSmall ? 'То (°C)' : 'Темп. обратки (°C)',
        };
    }, [isXSmall]);

    const [сolumCaptions, setColumCaptions] = useState(defaultColumCaptions);

    useEffect(() => {
        setColumCaptions(defaultColumCaptions);
    }, [defaultColumCaptions]);

    const outdoorTemperatureValidationRules = useMemo<ValidationRule[]>(() => {
        return [
            {
                type: 'required',
                message: 'Обязательное значение'
            },
            {
                type: 'range',
                min: -35,
                max: 25,
                message: 'Допустумые значения в диапазоне от -35°C до 25°C'
            },
            {
                type:'custom',
                validationCallback: (options: ValidationCallbackData) => {
                    const items = temperatureGraphStore.createQuery().toArray();
                    const existedValue = items.find(t => t.outdoorTemperature === options.value && t.id !== options.data.id);

                    return !existedValue;
                },
                message: 'Значение уже существует'
            }] as ValidationRule[]
    }, [temperatureGraphStore]);

    const supplyPipeTemperatureValidationRules = useMemo<ValidationRule[]> (() => [
        {
            type: 'required',
            message: 'Обязательное значение'
        },
        {
            type: 'range',
            min: 35,
            max: 120,
            message: 'Допустумые значения в диапазоне от 35°C до 120°C'
        },
        {
            type: 'custom',
            validationCallback: (options: ValidationCallbackData) => {

                return !options.data.returnPipeTemperature || options.data.returnPipeTemperature < options.value;
            },
            message: 'Значение Тп всегда больше Тo'
        }
    ], [])

    const returnPipeTemperatureValidationRules = useMemo<ValidationRule[]> (() => [
        {
            type: 'required',
            message: 'Обязательное значение'
        },
        {
            type: 'range',
            min: 20,
            max: 80,
            message: 'Допустумые значения в диапазоне от 20°C до 80°C'
        },
        {
            type: 'custom',
            validationCallback: (options: ValidationCallbackData) => {

                return !options.data.supplyPipeTemperature || options.data.supplyPipeTemperature > options.value;
            },
            message: 'Значение То всегда меньше Тп'
        }
    ], []);

    return (
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
                dataField='outdoorTemperature'
                caption={ сolumCaptions.outdoorTemperatureColCaption }
                allowSorting={ true }
                sortOrder='asc'
                validationRules={ outdoorTemperatureValidationRules }
            />

            <Column
                dataField='supplyPipeTemperature'
                caption={ сolumCaptions.supplyPipeTemperatureColCaption }
                allowSorting={ false }
                validationRules={ supplyPipeTemperatureValidationRules }
            />

            <Column
                dataField='returnPipeTemperature'
                caption={ сolumCaptions.returnPipeTemperature }
                allowSorting={ false }
                validationRules={ returnPipeTemperatureValidationRules }
            />

            <Editing mode='row' allowUpdating allowDeleting />
        </DataGrid>
    )
}