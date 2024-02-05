import { useRef } from 'react';
import Chart, { ArgumentAxis, CommonAxisSettings, Crosshair, Font, Grid, Legend, Point, Series, Title, Tooltip, ValueAxis } from 'devextreme-react/chart';
import { useTemperatureGraphContext } from './temperature-graph-context';
import { getUuidV4 } from '../../../../utils/uuid';
import AppConstants from '../../../../constants/app-constants';
import { OutdoorIcon, ReturnPipeIcon, SupplyPipeIcon } from '../../../../constants/app-icons';
import ArrayStore from 'devextreme/data/array_store';
import { TemperatureGraphItemModel } from '../../../../models/regulator-settings/temperature-graph-model';
import { formatMessage } from 'devextreme/localization';


const TooltipTemplate = (info: any) => {

    return (
        <div className='temperature-graph-tooltip' data-guid={ getUuidV4() } style={ {  } }>
            <div>
                <OutdoorIcon size={ 18 } />
                <div>Наружный воздух:</div>
                <div>{`${info.point.data.outdoorTemperature.toLocaleString(undefined, { minimumFractionDigits: 1 })}`} °C</div>
            </div>
            <div>
                <SupplyPipeIcon size={ 18 } />
                <div>Подача:</div>
                <div>{info.point.data.supplyPipeTemperature.toLocaleString(undefined, { minimumFractionDigits: 1 })} °C</div>
            </div>
            <div>
                <ReturnPipeIcon size={ 18 } />
                <div>Обратка:</div>
                <div>{info.point.data.returnPipeTemperature.toLocaleString(undefined, { minimumFractionDigits: 1 })} °C</div>
            </div>
        </div>
    );
}

export const TemperatureGraphChart = ({ dataSource, showPoints }: { dataSource: ArrayStore<TemperatureGraphItemModel, any>, showPoints: boolean }) => {
    const chartRef = useRef<Chart>(null);
    const { chartArgumentAxisInverted } = useTemperatureGraphContext();

    return (
        <Chart
            className='temperature-graph-chart'
            ref={ chartRef }
            dataSource={ dataSource }
            height={ AppConstants.chartHeight }
        >
            <Tooltip
                enabled
                arrowLength={ 5 }
                opacity={ 1 }
                contentRender={ TooltipTemplate }
            />
            <Crosshair
                enabled
                color='grey'
                dashStyle='dot'
                horizontalLine={ false }
            />
            <Series
                name='supplyPipe'
                argumentField="outdoorTemperature"
                valueField="supplyPipeTemperature"
                showInLegend={ true }
                type='spline' color={ AppConstants.colors.supplyPipeColor }>
                    <Point visible={ showPoints } size={ 8 }  symbol='circle'/>
            </Series>

            <Series
                name='returnPipe'
                argumentField="outdoorTemperature"
                valueField="returnPipeTemperature"
                showInLegend={ true }
                color={ AppConstants.colors.returnPipeColor }
                type='spline' >
                    <Point visible={ showPoints } size={ 8 }  symbol='square'/>
                </Series>
            <ArgumentAxis inverted={ chartArgumentAxisInverted }>
                <Grid />
                <Title text={ formatMessage('app-outdoor-temperature') } font={ { size: 12 } } />
            </ArgumentAxis>

            <ValueAxis>
                <Grid />
                <Title text={ formatMessage('app-media-temperature') }>
                    <Font size={ 12 } />
                </Title>
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
                verticalAlignment='top'
                horizontalAlignment= { chartArgumentAxisInverted ? 'left' : 'right' }
                itemTextPosition='right'
                columnCount={ 1 }
                markerSize={ 10 }
                markerRender={ (markerInfo: any) => {

                    return (
                        <>
                            {
                                markerInfo.series.name === 'supplyPipe'
                                    ? <circle cx={ 5 } cy={ 5 } r={ 5 } fill={ AppConstants.colors.supplyPipeColor }></circle>
                                    : <rect x={ 0 } y={ 0 } width={ 9 } height={ 9 } fill={ AppConstants.colors.returnPipeColor }></rect>
                            }
                        </>
                    )
                } }
            />
        </Chart>
    );
}