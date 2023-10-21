import { TempregatureGraphProvider } from './temperature-graph-context';
import './temperature-graph-tab-content.scss';
import { TemperatureGraphGrid } from './temperture-graph-grid'

export const TemperatureGraphTabContent = () => {
    return (
        <TempregatureGraphProvider>
            <div className='setting-form'>
                <TemperatureGraphGrid />
            </div>
        </TempregatureGraphProvider>
    )
}