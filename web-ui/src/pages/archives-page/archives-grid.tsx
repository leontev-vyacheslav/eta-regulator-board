import { DataGrid, Column, Selection, Format } from 'devextreme-react/data-grid';
import AppConstants from '../../constants/app-constants';
import { ArchiveModel } from '../../models/regulator-settings/archive-model';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useScreenSize } from '../../utils/media-query';
import { formatMessage } from 'devextreme/localization';


export const ArchivesGrid = ({ dataSource }: {dataSource: ArchiveModel[]}) => {
    const { isXSmall } = useScreenSize();
    const dataGridRef = useRef<DataGrid<ArchiveModel>>(null);

    const defaultColumCaptions = useMemo(() => {
        return {
            datetime: isXSmall ? 'Время' : formatMessage('app-measurement-time'),
            outdoorTemperature: isXSmall ? 'Tвн, °C' : 'Внеш. темп. (°C)',
            supplyPipeTemperature: isXSmall ? 'Тп, °C' : 'Темп. подачи (°C)',
            returnPipeTemperature: isXSmall ? 'То, °C' : 'Темп. обратки (°C)',
        };
    }, [isXSmall]);

    const [columnCaptions, setColumnCaptions] = useState(defaultColumCaptions);

    useEffect(() => {
        setColumnCaptions(defaultColumCaptions);
    }, [defaultColumCaptions]);

    return (
        <DataGrid
            ref={ dataGridRef }
            className='app-grid temperature-graph-grid'
            showColumnLines
            dataSource={ dataSource }
            height={ () => AppConstants.pageHeight }
        >
            <Selection mode='single' />
            <Column
                dataType='datetime'
                dataField='datetime'
                width={ 90 }
                caption={ columnCaptions.datetime }
                allowSorting={ true }
                sortOrder='asc'
            >
                <Format type='shortTime' />
            </Column>
            <Column
                dataType='string'
                dataField='outdoorTemperature'
                caption={ columnCaptions.outdoorTemperature }
            />

            <Column
                dataType='number'
                dataField='supplyPipeTemperature'
                caption={ columnCaptions.supplyPipeTemperature }
            />

            <Column
                dataType='number'
                dataField='returnPipeTemperature'
                caption={ columnCaptions.returnPipeTemperature }
            />
        </DataGrid>
    );
}


