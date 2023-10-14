import DataGrid, { Column, Editing, Selection } from 'devextreme-react/data-grid'

export const TemperatureGraphForm = () => {
    const defaultTemperatureGraph = {
        items: [
            {
                outdoorTemperature: -30.0,
                supplyPipeTemperature: 90.0,
                returnPipeTemperature: 60.0
            },
            {
                outdoorTemperature: 10.0,
                supplyPipeTemperature: 33.5,
                returnPipeTemperature: 29.6
            }
        ]
    }

    return (
        <DataGrid dataSource={ defaultTemperatureGraph.items } height={ '50vh' } className='setting-grid'>
            <Selection mode='single' />
            <Column dataField='outdoorTemperature' caption='Внеш. (°C)' allowSorting={ false } />
            <Column dataField='supplyPipeTemperature' caption='Подача (°C)' allowSorting={ false } />
            <Column dataField='returnPipeTemperature' caption='Обратка (°C)' allowSorting={ false } />
            <Editing mode='row' allowUpdating={ true } />
        </DataGrid>
    )
}