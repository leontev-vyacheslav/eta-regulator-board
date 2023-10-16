import { PageToolbar } from '../../../../components/page-toolbar/page-toolbar'
import { TemperatureGraphGrid } from './temperture-graph-grid'
import { useTemperatureGraphMenuItems } from './use-temperature-graph-menu-items';

export const TemperatureGraphContent = () => {
    const menuItems = useTemperatureGraphMenuItems();

    return (
        <>
            <PageToolbar title={ 'Температурный график' } menuItems={ menuItems } />
            <TemperatureGraphGrid />
        </>
    )
}