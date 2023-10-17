import { DataGrid } from 'devextreme-react'
import { useSchedulesContext } from './schedules-context'

export const SchedulesGrid = () => {
    const { dataGridRef } = useSchedulesContext();

    return (
        <DataGrid ref={ dataGridRef } height={ '50vh' }>

        </DataGrid>
    )
}