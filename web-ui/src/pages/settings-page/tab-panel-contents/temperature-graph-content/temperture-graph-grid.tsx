import './temperature-graph-content.scss';

import DataGrid, { Column, Editing, Selection } from 'devextreme-react/data-grid'
import { useSettingPageContext } from '../../settings-page-context';
import { useScreenSize } from '../../../../utils/media-query';
import { useEffect, useMemo, useState } from 'react';
import ArrayStore from 'devextreme/data/array_store';
import { TemperatureGraphItemModel } from '../../../../models/regulator-settings/temperature-graph-model';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { useTemperatureGraphContext } from './temperature-graph-context';

export const TemperatureGraphGrid = () => {
    const { regulatorSettings } = useSettingPageContext();
    const { isXSmall, isSmall } = useScreenSize();
    const { putRegulatorSettingsAsync } = useAppData();
    const { dataGridRef } = useTemperatureGraphContext();



    const store = useMemo(() => new ArrayStore({
        key: 'id',
        data: regulatorSettings?.regulatorParameters.temperatureGraph.items,
        onInserted: (values: TemperatureGraphItemModel, key: any) => {
            console.log(values, key);
        },
        onUpdated: async (key: any, values: TemperatureGraphItemModel) => {
            console.log(values, key);
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
        }
    }), [putRegulatorSettingsAsync, regulatorSettings]);


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
            ref={ dataGridRef }
            className='app-grid temperagure-graph-grid'
            showColumnLines
            width={ isXSmall || isSmall ? '100%' : 600 }
            dataSource={ store }
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