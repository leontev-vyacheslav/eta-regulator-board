import DataGrid, { Column, Editing } from 'devextreme-react/data-grid'
import { useGpioTabContext } from './gpio-tab-context';
import { useMemo } from 'react';
import ArrayStore from 'devextreme/data/array_store';
import AppConstants from '../../../../constants/app-constants';

export const GpioGrid = () => {
    const { gpioSet } = useGpioTabContext();

    const gpioStore = useMemo(() => {
        return new ArrayStore({
            data: gpioSet?.items,
        });
    }, [gpioSet?.items]);

    return (
        <DataGrid
            dataSource={ gpioStore }
            showColumnHeaders={ false }
            height={ AppConstants.formHeight }
            focusedRowEnabled
        >
            <Column dataField='pin' width={ '50px' } allowEditing={ false } />
            <Column dataField='description' alignment='left' allowEditing={ false } />
            <Column dataField='state' width={ '50px' } />
            <Editing allowUpdating mode='cell' />
        </DataGrid>
    )
}