import { Chart, Tooltip, Crosshair, Series, Point, ArgumentAxis, Grid, Title, ValueAxis, Font, CommonAxisSettings, Legend, Label, MinorGrid, Tick } from 'devextreme-react/chart';
import { useRef } from 'react';
import AppConstants from '../../constants/app-constants';
import { ArchiveModel } from '../../models/regulator-settings/archive-model';
import { formatMessage } from 'devextreme/localization';

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

            <ArgumentAxis>
                <Grid visible />
                <MinorGrid visible />
                <Title text={ formatMessage('app-measurement-time') } font={ { size: 12 } } />
                <Label rotationAngle={ 270 } indentFromAxis={ 15 } displayMode='rotate' format={ 'shortTime' } />
            </ArgumentAxis>

            <ValueAxis name='outdoorAxis' position='right'>
                <Tick length={ 4 } shift={ 2 }/>
                <Title text={ formatMessage('app-outdoor-temperature') } >
                    <Font size={ 12 } />
                </Title>
            </ValueAxis>

            <ValueAxis name='pipeAxis'>
                <Tick length={ 4 } shift={ 2 } />

                <Grid />
                <Title text={ formatMessage('app-media-temperature') } >
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
                    switch (seriesInfo.seriesName) {
                        case 'supplyPipe':
                            return'Подача'
                        case 'returnPipe':
                            return 'Обратка'
                        case 'outdoor':
                            return 'Внешний'
                        default:
                            return ''
                    }
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
                                    : markerInfo.series.name === 'returnPipe' ? <rect x={ 0 } y={ 0 } width={ 9 } height={ 9 } fill={ AppConstants.colors.returnPipeColor }></rect>

                                    : <polygon points={ '5,0 0,10 10,10 ' } fill={ AppConstants.colors.outdoorColor } />
                            }
                        </>
                    )
                } }
            />

            <Series
                name='supplyPipe'
                axis='pipeAxis'
                valueField="supplyPipeTemperature"
                argumentField="datetime"
                showInLegend={ true }
                type='spline' color={ AppConstants.colors.supplyPipeColor }>
                    <Point visible={ true } size={ 8 } symbol='circle'/>
            </Series>

            <Series
                name='returnPipe'
                axis='pipeAxis'
                valueField='returnPipeTemperature'
                argumentField='datetime'
                showInLegend={ true }
                color={ AppConstants.colors.returnPipeColor }
                type='spline' >
                    <Point visible={ true } size={ 8 } symbol='square'/>
            </Series>

            <Series
                name='outdoor'
                axis='outdoorAxis'
                valueField='outdoorTemperature'
                argumentField='datetime'
                showInLegend={ true }
                color={ AppConstants.colors.outdoorColor }
                type='spline'
            >
                <Point visible={ true } size={ 8 } symbol='triangle'/>
            </Series>
        </Chart>
    );
}

