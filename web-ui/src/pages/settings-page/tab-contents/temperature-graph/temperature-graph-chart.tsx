import { useRef } from 'react';
import Chart, { ArgumentAxis, CommonAxisSettings, CommonSeriesSettings, Grid, Label, Series, Title, Tooltip, ValueAxis } from 'devextreme-react/chart';
import Form, { SimpleItem } from 'devextreme-react/form';
import { useTemperatureGraphContext } from './temperature-graph-context';

const TooltipTemplate = (info) => {
    // const id = info.point.data.id;
    // const currentItem = regulatorSettings?.heatingCircuits.items[circuitId ? parseInt(circuitId) : 0].regulatorParameters.temperatureGraph.items.find(i => i.id === id);
    const currentItem = null;

    return (
        <Form formData={ currentItem } width={ 150 }>
            <SimpleItem
                dataField='returnPipeTemperature'
                editorType='dxNumberBox'
                label={ { visible: false } }
                editorOptions={ { showSpinButtons: true, useLargeSpinButtons: true, onValueChanged: (e) => {

                } } }
                />
        </Form>
    )
}

export const TemperatureGraphChart = ({ dataSource }: { dataSource: any }) => {
    const chartRef = useRef<Chart>(null);
    const { chartArgumentAxisInverted } = useTemperatureGraphContext();

    return (
        <Chart
            ref={ chartRef }
            dataSource={ dataSource }
            height={ '50vh' }
            onPointClick={ (e) => {
                // e.target.showTooltip();
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