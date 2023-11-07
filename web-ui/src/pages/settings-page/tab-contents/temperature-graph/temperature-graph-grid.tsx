import DataGrid, { Column, Editing, Selection } from 'devextreme-react/data-grid'
import { ValidationCallbackData, ValidationRule } from 'devextreme/common';
import { formatMessage } from 'devextreme/localization';
import { useEffect, useMemo, useState } from 'react';
import { useScreenSize } from '../../../../utils/media-query';
import { useTemperatureGraphContext } from './temperature-graph-context';

export const TemperatureGraphGrid = ({ dataSource }: { dataSource: any }) => {
    const { dataGridRef } = useTemperatureGraphContext()
    const { isXSmall, isSmall } = useScreenSize();

    const defaultColumCaptions = useMemo(() => {
        return {
            outdoorTemperatureColCaption: isXSmall ? 'Tвн, °C' : 'Внеш. темп. (°C)',
            supplyPipeTemperatureColCaption: isXSmall ? 'Тп, °C' : 'Темп. подачи (°C)',
            returnPipeTemperature: isXSmall ? 'То, °C' : 'Темп. обратки (°C)',
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
                    const items = dataSource.createQuery().toArray();
                    const existedValue = items.find(t => t.outdoorTemperature === options.value && t.id !== options.data.id);

                    return !existedValue;
                },
                message: formatMessage('validation-value-already-existed')
            }] as ValidationRule[]
    }, [dataSource]);

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
        <DataGrid
            ref={ dataGridRef }
            className='app-grid temperagure-graph-grid'
            showColumnLines
            width={ isXSmall || isSmall ? '100%' : 600 }
            dataSource={ dataSource }
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
                editorOptions={ { mask: '#00', maskChar: ' ' } }
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
    )
}