import { Chart, Tooltip, Crosshair, Series, Point, ArgumentAxis, Grid, Title, ValueAxis, Font, CommonAxisSettings, Legend, Label, MinorGrid, Tick } from 'devextreme-react/chart';
import { useCallback, useRef } from 'react';
import AppConstants from '../../constants/app-constants';
import { formatMessage } from 'devextreme/localization';
import { ArchiveChartTooltip } from './archive-chart-tooltip';
import { ArchivesChartProps } from '../../models/archives-chart-props';


export const ArchivesChart = ({ dataSource, isShowTwoAxis, isShowLegends, isShowCalculatedValues }: ArchivesChartProps) => {
    const chartRef = useRef<Chart>(null);
    const markerRender = useCallback((markerInfo: any) => {

        switch (markerInfo.series.name) {
            case 'supplyPipe':
                return <circle cx={ 5 } cy={ 5 } r={ 5 } fill={ AppConstants.colors.supplyPipeColor }></circle>;
            case 'returnPipe':
                return <rect x={ 0 } y={ 0 } width={ 9 } height={ 9 } fill={ AppConstants.colors.returnPipeColor }></rect>;

            case 'calculatedSupplyPipe':
                return (
                    <path d="M5,5 L13,13 M13,5 L5,13" strokeWidth={ 2 } stroke={ AppConstants.colors.supplyPipeColor }/>
                );
            case 'calculatedReturnPipe':
                return (
                    <polygon points="5,0 10,5 5,10 0,5" fill={ AppConstants.colors.returnPipeColor } />
                );

            default:
                return <polygon points={ '5,0 0,10 10,10 ' } fill={ AppConstants.colors.outdoorColor } />
        }

    }, []);
    return (
        <Chart
            className='temperature-graph-chart'
            ref={ chartRef }
            dataSource={ dataSource }
            height={ () => AppConstants.pageHeight }
            margin={ { top: 10, bottom: 10, left: 10, right: 10 } }
        >
            <Tooltip
                enabled
                arrowLength={ 5 }
                opacity={ 1 }
                contentRender={ (info) => { return <ArchiveChartTooltip info={ info } isShowCalculatedValues={ isShowCalculatedValues } /> } }
            />
            <Crosshair
                enabled
                color='grey'
                dashStyle='dot'
                horizontalLine={ false }
            />
            <CommonAxisSettings
            valueMarginsEnabled = { true }
    />
            <ArgumentAxis>
                <Grid visible />
                <MinorGrid visible />
                <Title text={ formatMessage('app-measurement-time') } font={ { size: 12 } } />
                <Label rotationAngle={ 270 } indentFromAxis={ 15 } displayMode='rotate' format={ 'shortTime' } />
            </ArgumentAxis>

            <ValueAxis
                name='commonAxis'
                position='left'
                visible={ !isShowTwoAxis }
                // maxValueMargin={ 0.5 }
                // minValueMargin={ 0.5 }

            >
                <Grid visible={ !isShowTwoAxis } />
                <Tick length={ 4 } shift={ 2 } visible={ !isShowTwoAxis } />
                {!isShowTwoAxis ?
                    <Title text={ formatMessage('app-temperatures') } >
                        <Font size={ 12 } />
                    </Title>
                    : null}
            </ValueAxis>

            <ValueAxis
                name='outdoorAxis'
                position='left'
                visible={ isShowTwoAxis }
                // maxValueMargin={ 0.5 }
                // minValueMargin={ 0.5 }
            >
                <Tick length={ 4 } shift={ 2 } visible={ isShowTwoAxis } />
                {isShowTwoAxis
                    ?
                    <Title text={ formatMessage('app-outdoor-temperature') } >
                        <Font size={ 12 } />
                    </Title>
                    : null
                }
            </ValueAxis>

            <ValueAxis
                name='pipeAxis'
                position='right'
                visible={ isShowTwoAxis }
                // maxValueMargin={ 0.5 }
                // minValueMargin={ 0.5 }
            >
                <Tick length={ 4 } shift={ 2 } visible={ isShowTwoAxis } />
                <Grid visible={ isShowTwoAxis } />
                {isShowTwoAxis
                    ?
                    <Title text={ formatMessage('app-media-temperature') } >
                        <Font size={ 12 } />
                    </Title>
                    : null
                }
            </ValueAxis>

            <CommonAxisSettings>
                <Grid visible />
            </CommonAxisSettings>

            <Legend
                visible={ isShowLegends }
                customizeText={ (seriesInfo: {
                    seriesColor: string;
                    seriesIndex: number;
                    seriesName: any;
                }) => {
                    switch (seriesInfo.seriesName) {
                        case 'supplyPipe':
                            return 'Подача'
                        case 'returnPipe':
                            return 'Обратка'
                        case 'outdoor':
                            return 'Внешний'
                        case 'calculatedSupplyPipe':
                            return 'Подача (темп. гр.)'
                        case 'calculatedReturnPipe':
                            return 'Обратка (темп. гр.)'
                        default:
                            return ''
                    }
                } }
                position='inside'
                verticalAlignment='top'
                horizontalAlignment={ 'left' }
                itemTextPosition='right'
                columnCount={ 1 }
                markerSize={ 10 }
                markerRender={ (markerInfo: any) => {
                    return markerRender(markerInfo);
                } }
            />

            <Series
                name='supplyPipe'
                axis={ !isShowTwoAxis ? 'commonAxis' : 'pipeAxis' }
                valueField="supplyPipeTemperature"
                argumentField="datetime"
                showInLegend={ true }
                type='spline' color={ AppConstants.colors.supplyPipeColor }>
                <Point visible={ true } size={ 8 } symbol='circle' />
            </Series>

            <Series
                name='returnPipe'
                axis={ !isShowTwoAxis ? 'commonAxis' : 'pipeAxis' }
                valueField='returnPipeTemperature'
                argumentField='datetime'
                showInLegend={ true }
                color={ AppConstants.colors.returnPipeColor }
                type='spline' >
                <Point visible={ true } size={ 8 } symbol='square' />
            </Series>

            <Series
                name='outdoor'
                axis={ !isShowTwoAxis ? 'commonAxis' : 'outdoorAxis' }
                valueField='outdoorTemperature'
                argumentField='datetime'
                showInLegend={ true }
                color={ AppConstants.colors.outdoorColor }
                type='spline'
            >
                <Point visible={ true } size={ 8 } symbol='triangle' />
            </Series>

            <Series
                name='calculatedSupplyPipe'
                axis={ !isShowTwoAxis ? 'commonAxis' : 'pipeAxis' }
                valueField="calculatedSupplyPipeTemperature"
                argumentField="datetime"
                showInLegend={ isShowCalculatedValues }
                type='spline' color={ AppConstants.colors.supplyPipeColor }
                visible={ isShowCalculatedValues }
            >
                <Point visible={ isShowCalculatedValues } size={ 8 } symbol='cross' />

            </Series>

            <Series
                name='calculatedReturnPipe'
                axis={ !isShowTwoAxis ? 'commonAxis' : 'pipeAxis' }
                valueField='calculatedReturnPipeTemperature'
                argumentField='datetime'
                showInLegend={ isShowCalculatedValues }
                color={ AppConstants.colors.returnPipeColor }
                type='spline'
                visible={ isShowCalculatedValues }
            >
                <Point visible={ isShowCalculatedValues } size={ 8 } symbol='polygon' />
            </Series>
        </Chart>
    );
}

