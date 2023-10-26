import './gpio-list-content.scss'

import { useRef } from 'react';
import { GpioList } from './gpio-list';
import { GpioItemModel } from '../../../../models/regulator-settings/gpio-set-model';
import List from 'devextreme-react/list';
import { GpioTabContextProvider } from './gpio-tab-context';

const GpioTabContentInner = () => {
    const listRef = useRef<List<GpioItemModel>>(null);

    return (
        <>
            <GpioList ref={ listRef }/>
        </>
    );
}

export const GpioTabContent = () => {
    return (
        <GpioTabContextProvider>
            <GpioTabContentInner />
        </GpioTabContextProvider>
    );
}