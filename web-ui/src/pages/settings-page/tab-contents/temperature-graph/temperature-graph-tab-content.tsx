import './temperature-graph-tab-content.scss';
import { TemperatureGraphContextProvider } from './temperature-graph-context';
import { TemperatureGraphGrid } from './temperture-graph-grid'

const TemperatureGraphTabContentInner = () => {


    return (
        <div className='setting-form'>
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