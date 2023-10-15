import './temperature-graph-form.scss';

import DataGrid, { Column, Editing, Selection } from 'devextreme-react/data-grid'
import { useSettingPageContext } from '../../settings-page-context';
import { useScreenSize } from '../../../../utils/media-query';
import { useEffect, useMemo, useState } from 'react';

export const TemperatureGraphForm = () => {
    const { regulatorSettings } = useSettingPageContext();
    const { isXSmall } = useScreenSize();

    const defaultColumCaptions = useMemo(() => {
        return {
            outdoorTemperatureColCaption: 'Внеш. темп. (°C)',
            supplyPipeTemperatureColCaption: 'Темп. подачи (°C)',
            returnPipeTemperature: 'Темп. обратки (°C)',
        };
    }, []);

    const extraSmallColumCaptions = useMemo(() => {
        return {
            outdoorTemperatureColCaption: 'Tвн. (°C)',
            supplyPipeTemperatureColCaption: 'Тп (°C)',
            returnPipeTemperature: 'То (°C)',
        };
    }, []);

    const [сolumCaptions, setColumCaptions] = useState(defaultColumCaptions);

    useEffect(() => {
        setColumCaptions(isXSmall ? extraSmallColumCaptions : defaultColumCaptions);
    }, [defaultColumCaptions, extraSmallColumCaptions, isXSmall])

    return (
        <DataGrid
            className='app-grid temperagure-graph-grid'
            showColumnLines
            dataSource={ regulatorSettings?.regulatorParameters.temperatureGraph.items }
            height={ '50vh' }
            >
            <Selection mode='single' />
            <Column dataField='outdoorTemperature' caption={ сolumCaptions.outdoorTemperatureColCaption } allowSorting={ false } />
            <Column dataField='supplyPipeTemperature' caption={ сolumCaptions.supplyPipeTemperatureColCaption } allowSorting={ false } />
            <Column dataField='returnPipeTemperature' caption={ сolumCaptions.returnPipeTemperature } allowSorting={ false } />
            <Editing mode='row' allowUpdating allowDeleting />
        </DataGrid>
    )
}