import List from 'devextreme-react/list'
import PageHeader from '../../components/page-header/page-header'
import AppConstants from '../../constants/app-constants'
import { GpioIcon } from '../../constants/app-icons'
import { GpioItemModel } from '../../models/regulator-settings/gpio-set-model'
import { GpioList } from './gpio-list'
import { useRef } from 'react'
import { GpioPageContextProvider } from './gpio-page-context'
import { PageToolbar } from '../../components/page-toolbar/page-toolbar'
import { useGpioListMenuItems } from './use-gpio-list-menu-items'

import './gpio-page.scss'

const GpioPageInner = () => {
    const listRef = useRef<List<GpioItemModel>>(null);
    const listMenuItems = useGpioListMenuItems();

    return (
        <>
            <PageHeader caption={ 'Вводы/выводы' }>
                <GpioIcon size={ AppConstants.headerIconSize } />
            </PageHeader>

            <div className={ 'content-block' }>
                <div className={ 'dx-card responsive-paddings' }>
                    <PageToolbar title={ 'Список элементов ввода/вывода' } menuItems={ listMenuItems } />
                    <GpioList ref={ listRef }/>
                </div>
            </div>
        </>
    )
};

export const GpioPage = () => {
    return (
        <GpioPageContextProvider>
            <GpioPageInner />
        </GpioPageContextProvider>
    );
};
