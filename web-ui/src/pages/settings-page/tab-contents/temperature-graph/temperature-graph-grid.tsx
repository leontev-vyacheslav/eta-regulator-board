import  { DataGrid, Column, Editing, Selection } from 'devextreme-react/data-grid'
import { ValidationCallbackData, ValidationRule } from 'devextreme/common';
import { formatMessage } from 'devextreme/localization';
import { useEffect, useMemo, useState } from 'react';
import { useScreenSize } from '../../../../utils/media-query';
import { useTemperatureGraphContext } from './temperature-graph-context';
import AppConstants from '../../../../constants/app-constants';

export const TemperatureGraphGrid = ({ dataSource }: { dataSource: any }) => {
    const { dataGridRef } = useTemperatureGraphContext()
    const { isXSmall } = useScreenSize();

    const defaultColumCaptions = useMemo(() => {
        return {
            outdoorTemperature: isXSmall ? 'Tвн, °C' : 'Внеш. темп. (°C)',
            supplyPipeTemperature: isXSmall ? 'Тп, °C' : 'Темп. подачи (°C)',
            returnPipeTemperature: isXSmall ? 'То, °C' : 'Темп. обратки (°C)',
        };
    }, [isXSmall]);

    const [columnCaptions, setColumnCaptions] = useState(defaultColumCaptions);

    useEffect(() => {
        setColumnCaptions(defaultColumCaptions);
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
            className='app-grid temperature-graph-grid'
            showColumnLines
            dataSource={ dataSource }
            height={ AppConstants.formHeight }
        >
            <Selection mode='single' />

            <Column
                dataType='string'
                dataField='outdoorTemperature'
                caption={ columnCaptions.outdoorTemperature }
                allowSorting={ true }
                sortOrder='asc'
                validationRules={ outdoorTemperatureValidationRules }
                editorOptions={ { mask: '#00', maskChar: ' ' } }
            />

            <Column
                dataType='number'
                dataField='supplyPipeTemperature'
                caption={ columnCaptions.supplyPipeTemperature }
                allowSorting={ false }
                validationRules={ supplyPipeTemperatureValidationRules }
            />

            <Column
                dataType='number'
                dataField='returnPipeTemperature'
                caption={ columnCaptions.returnPipeTemperature }
                allowSorting={ false }
                validationRules={ returnPipeTemperatureValidationRules }
            />

            <Editing mode='row' allowUpdating allowDeleting />
        </DataGrid>
    )
}