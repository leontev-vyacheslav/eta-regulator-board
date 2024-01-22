import { Chart, Tooltip, Crosshair, Series, Point, ArgumentAxis, Grid, Title, ValueAxis, Font, CommonAxisSettings, Legend, Label, MinorGrid } from 'devextreme-react/chart';
import { useRef } from 'react';
import AppConstants from '../../constants/app-constants';
import { ArchiveModel } from '../../models/regulator-settings/archive-model';

export const ArchivesChart = ({ dataSource }: {dataSource: ArchiveModel[]}) => {
    const chartRef = useRef<Chart>(null);

    return (
        <Chart
            className='temperature-graph-chart'
            ref={ chartRef }
            dataSource={ dataSource }
            height={ () => AppConstants.pageHeight  }
            margin={ { top: 10, bottom: 10, left: 10, right: 10 } }
        >
            <Tooltip
                enabled
                arrowLength={ 5 }
                opacity={ 1 }
                contentRender={ () => {  return null } }
            />
            <Crosshair
                enabled
                color='grey'
                dashStyle='dot'
                horizontalLine={ false }
            />
            <Series
                name='supplyPipe'
                valueField="supplyPipeTemperature"
                argumentField="datetime"
                showInLegend={ true }
                type='spline' color={ AppConstants.colors.supplyPipeColor }>
                    <Point visible={ true } size={ 8 } symbol='circle'/>
            </Series>

            <Series
                name='returnPipe'
                valueField="returnPipeTemperature"
                argumentField="datetime"
                showInLegend={ true }
                color={ AppConstants.colors.returnPipeColor }
                type='spline' >
                    <Point visible={ true } size={ 8 } symbol='square'/>
                </Series>
            <ArgumentAxis>
                <Grid visible />
                <MinorGrid visible />
                <Title text='Время измерения' font={ { size: 12 } }  />
                <Label rotationAngle={ 270 } indentFromAxis={ 15 } displayMode='rotate'  format={ 'shortTime' }  />
            </ArgumentAxis>

            <ValueAxis>
                <Grid />
                <Title text='Температура носителя, °C'>
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
                horizontalAlignment= { 'right' }
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

