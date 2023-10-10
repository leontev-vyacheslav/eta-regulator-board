import './debug-page.scss';

import AppConstants from '../../constants/app-constants';
import { DebugIcon } from '../../constants/app-icons';
import PageHeader from '../../components/page-header/page-header';
import { useEffect, useRef, useState } from 'react';
import List from 'devextreme-react/list';
import Switch from 'devextreme-react/switch';
import { TestModel } from '../../models/data/test-model';
import { PageToolbar } from '../../components/page-toolbar/page-toolbar';
import { useTestListMenuItems } from './use-test-list-menu-items';
import { TestList } from './test-list';
import { DebugPageContextProvider } from './debug-page-context';
import { useGpioData } from '../../contexts/app-data/use-gpio-data';
import { GpioItemModel, GpioSetModel } from '../../models/regulator-settings/gpio-set-model';

const DebugPageInner = () => {
    const listRef = useRef<List<TestModel>>(null);
    const listMenuItems = useTestListMenuItems({ listRef });
    const { putGpioAsync, getGpioAllAsync } = useGpioData();
    const [gpioSet, setGpioSet] = useState<GpioSetModel | null>(null);

    useEffect(() => {
        (async () => {
            const gpioSet = await getGpioAllAsync();
            setGpioSet(gpioSet);
        })();
    }, [getGpioAllAsync]);

    return (
        <>
            <PageHeader caption={ 'Отладка' }>
                <DebugIcon size={ AppConstants.headerIconSize } />
            </PageHeader>

            <div className={ 'content-block' }>
                <div className={ 'dx-card responsive-paddings' }>
                    <PageToolbar title={ 'Тестовый список' } menuItems={ listMenuItems } />
                    <TestList ref={ listRef } />

                    <List className='app-list' height={ 200 } items={ gpioSet?.items } itemRender={ (gpioItem: GpioItemModel) => {
                        return (
                            <div key={ gpioItem.pin } style={ { display: 'flex', flexDirection: 'row', alignItems: 'center' } }>
                                <div style={ { display: 'flex', width: 75,  justifyContent: 'flex-start' } }>GPIO{gpioItem.pin}:</div>
                                <div style={ { flex: 1 } }>{gpioItem.description}</div>
                                <div style={ { flex: 1, display: 'flex', justifyContent: 'flex-end' } }>
                                    <Switch defaultValue={ gpioItem.state } onValueChanged={ async (e) => {
                                        const gpio = await putGpioAsync(gpioItem.pin, e.value);

                                        if(gpio && gpio.pin === gpioItem.pin && gpio.state === e.value) {
                                            gpioItem.state = e.value;
                                            console.log(gpioSet);
                                        }
                                    } } />
                                </div>
                            </div>
                        )
                    } } />
                </div>
            </div>
        </>
    )
};

export default () => {
    return (
        <DebugPageContextProvider>
            <DebugPageInner />
        </DebugPageContextProvider>
    );
};
