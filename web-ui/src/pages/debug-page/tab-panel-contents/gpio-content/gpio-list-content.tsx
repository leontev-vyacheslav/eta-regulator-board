import './gpio-list.scss'

import { useRef } from 'react';
import { PageToolbar } from '../../../../components/page-toolbar/page-toolbar';
import { GpioList } from './gpio-list';
import { GpioItemModel } from '../../../../models/regulator-settings/gpio-set-model';
import List from 'devextreme-react/list';
import { useGpioListMenuItems } from './use-gpio-list-menu-items';

export const GpioListTabPanelContent = () => {
    const listRef = useRef<List<GpioItemModel>>(null);
    const listMenuItems = useGpioListMenuItems();

    return (
        <>
            <PageToolbar title={ 'Элементы ввода/вывода' } menuItems={ listMenuItems } />
            <GpioList ref={ listRef }/>
        </>
    );
}