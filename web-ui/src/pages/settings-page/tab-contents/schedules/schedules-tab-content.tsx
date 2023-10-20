import './schedules.scss';
import { SchedulesContextProvider } from './schedules-context'
import { SchedulesGrid } from './schedules-grid'

export const SchedulesTabContent = () => {
    return (
        <SchedulesContextProvider>
            <div className='setting-form'>
                <SchedulesGrid />
            </div>
        </SchedulesContextProvider>
    );
}