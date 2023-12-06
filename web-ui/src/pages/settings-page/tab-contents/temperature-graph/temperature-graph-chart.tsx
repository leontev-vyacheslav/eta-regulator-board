import { useRef } from 'react';
import Chart, { ArgumentAxis, CommonAxisSettings, Grid, Legend, Series, Title, Tooltip, ValueAxis } from 'devextreme-react/chart';
import { useTemperatureGraphContext } from './temperature-graph-context';
import { useScreenSize } from '../../../../utils/media-query';
import { getUuidV4 } from '../../../../utils/uuid';


const TooltipTemplate = (info: any) => {

    return (
        <div data-guid={ getUuidV4() }>
            <div>Температура наружного воздуха: {` ${info.point.data.outdoorTemperature}`} °C</div>
            <div>Температура носителя: {info.seriesName === 'supplyPipe' ? `${info.point.data.supplyPipeTemperature}` : `${info.point.data.returnPipeTemperature}`} °C`</div>
        </div>
    )
}

export const TemperatureGraphChart = ({ dataSource }: { dataSource: any }) => {
    const { isXSmall, isSmall } = useScreenSize();
    const chartRef = useRef<Chart>(null);
    const { chartArgumentAxisInverted } = useTemperatureGraphContext();

    return (
        <Chart
            className='test-chart'
            ref={ chartRef }
            dataSource={ dataSource }
            height={ '50vh' }
            width={ isXSmall || isSmall ? '100%' : 600 }
        >
            <Tooltip
                enabled
                arrowLength={ 5 }
                opacity={ 1 }
                contentRender={ TooltipTemplate }
            />
            <Series
                name='supplyPipe'
                argumentField="outdoorTemperature"
                valueField="supplyPipeTemperature"
                showInLegend={ true }
                color={ '#f5564a' }
                type='spline'
                point={ { visible: false } }
            >

            </Series>

            <Series
                name='returnPipe'
                argumentField="outdoorTemperature"
                valueField="returnPipeTemperature"
                showInLegend={ true }
                color={ '#1db2f5' }
                type='spline'
                point={ { visible: false } }
            />
            <ArgumentAxis inverted={ chartArgumentAxisInverted }>
                <Grid />
                <Title text='Температура наружного воздуха, °C' font={ { size: 12 } } />
            </ArgumentAxis>

            <ValueAxis>
                <Grid />
                <Title text='Температура носителя, °C' font={ { size: 12 } } />
            </ValueAxis>

            <CommonAxisSettings>
                <Grid visible />
            </CommonAxisSettings>

            <Legend
                visible={ true }
                customizeText={ (seriesInfo: {
                    seriesColor: string;
                    seriesIndex: number;
                    seriesName: any;
                }) => {
                    return seriesInfo.seriesName === 'supplyPipe' ? 'Подача' : 'Обратка'
                } }
                position='inside'
                verticalAlignment='bottom'
                horizontalAlignment='center'
                itemTextPosition='right'
            />
        </Chart>
    );
}