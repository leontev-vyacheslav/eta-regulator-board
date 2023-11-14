import { useRef } from 'react';
import Chart, { ArgumentAxis, CommonAxisSettings, CommonSeriesSettings, Grid, Label, Series, Title, ValueAxis } from 'devextreme-react/chart';
import { useTemperatureGraphContext } from './temperature-graph-context';
import { useScreenSize } from '../../../../utils/media-query';



// const TooltipTemplate = (info) => {

//     const { regulatorSettings, circuitId } = useSettingPageContext();

//     const currentItem = useMemo (() => {
//         return regulatorSettings?.heatingCircuits.items[circuitId].regulatorParameters.temperatureGraph.items.find(i => i.id === info.point.data.id);
//     }, [circuitId, info.point.data.id, regulatorSettings?.heatingCircuits.items]);
//     // const currentItem = null;

//     return (
//         <Form formData={ currentItem } width={ 150 } height={ 50 } >
//             <SimpleItem
//                 dataField='returnPipeTemperature'
//                 editorType='dxSlider'
//                 label={ { visible: false } }
//                 editorOptions={ { showSpinButtons: true, useLargeSpinButtons: true, min: 0, max: 100, onValueChanged: (e) => {

//                 } } }
//                 />
//         </Form>
//     )
// }

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
            onPointClick={ () => {
                // setIsPopupSlider(true);
            } }
        >
            {/* <Tooltip
                enabled
                opacity={ 1 }
                interactive
                contentRender={ TooltipTemplate }
            /> */}
            <Series
                argumentField="outdoorTemperature"
                valueField="supplyPipeTemperature"
                showInLegend={ false }
                color={ '#f5564a' }
                type='spline'

            />
            <Series
                argumentField="outdoorTemperature"
                valueField="returnPipeTemperature"
                showInLegend={ false }
                color={ '#1db2f5' }
                type='spline'
            />
            <ArgumentAxis inverted={ chartArgumentAxisInverted }>
                <Grid />
                <Title text='Температура наружнего воздуха, °C'  font={ { size: 12 } }/>
            </ArgumentAxis>

            <ValueAxis>
                <Grid />
                <Title text='Температура носителя, °C'  font={ { size: 12 } }/>
            </ValueAxis>

            <CommonAxisSettings>
                <Grid visible />
            </CommonAxisSettings>

            <CommonSeriesSettings>
                <Label visible customizeText={ (arg) => {
                    return arg.valueText + '°C';
                } } />
            </CommonSeriesSettings>
        </Chart>
    );
}