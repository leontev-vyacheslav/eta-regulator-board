import './temperature-graph-tab-content.scss';
import { PageToolbar } from '../../../../components/page-toolbar/page-toolbar'
import { TemperatureGraphContextProvider } from './temperature-graph-context';
import { TemperatureGraphGrid } from './temperture-graph-grid'
import { useTemperatureGraphMenuItems } from './use-temperature-graph-menu-items';

const TemperatureGraphTabContentInner = () => {
    const menuItems = useTemperatureGraphMenuItems();

    return (
        <div className='setting-form'>
            <PageToolbar title={ 'Температурный график' } menuItems={ menuItems } />
            <TemperatureGraphGrid />
        </div>
    )
}

export const TemperatureGraphTabContent = () => {
    return (
        <TemperatureGraphContextProvider>
            <TemperatureGraphTabContentInner />
        </TemperatureGraphContextProvider>
    )
}