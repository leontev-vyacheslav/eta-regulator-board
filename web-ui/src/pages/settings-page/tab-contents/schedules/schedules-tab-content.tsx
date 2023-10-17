import { PageToolbar } from '../../../../components/page-toolbar/page-toolbar'
import { SchedulesContextProvider } from './schedules-context'
import { SchedulesGrid } from './schedules-grid'
import { useSchedulesMenuItems } from './use-schedules-menu-items';

const SchedulesTabContentInner = () => {
    const menuItems = useSchedulesMenuItems();

    return (
        <div className='setting-form'>
            <PageToolbar title={ 'Расписания' } menuItems={ menuItems } />
            <SchedulesGrid />
        </div>
    )
}

export const SchedulesTabContent = () => {
    return (
        <SchedulesContextProvider>
            <SchedulesTabContentInner />
        </SchedulesContextProvider>
    );
}