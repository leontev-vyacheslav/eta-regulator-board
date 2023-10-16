import './debug-page.scss';

import AppConstants from '../../constants/app-constants';
import { DebugIcon } from '../../constants/app-icons';
import PageHeader from '../../components/page-header/page-header';
import { useState } from 'react';
import { TestListContextProvider } from './tab-panel-contents/test-content/test-list-context';
import { TabPanel, Item as TabPanelItem } from 'devextreme-react/tab-panel';
import { TestListTabPanelContent } from './tab-panel-contents/test-content/test-list-content';
import { GpioListContextProvider } from './tab-panel-contents/gpio-content/gpio-list-context';
import { GpioListTabPanelContent } from './tab-panel-contents/gpio-content/gpio-list-content';


export const DebugPage = () => {
    const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

    return (
        <>
            <PageHeader caption={ 'Отладка' }>
                <DebugIcon size={ AppConstants.headerIconSize } />
            </PageHeader>

            <div className={ 'content-block' }>
                <div className={ 'dx-card responsive-paddings' }>
                    <TabPanel onSelectedIndexChange={ (value: number) => {
                        setActiveTabIndex(value);
                    } }>
                        <TabPanelItem title='Ввод/вывод'>
                        {activeTabIndex === 0 ?
                                <GpioListContextProvider>
                                    <GpioListTabPanelContent />
                                </GpioListContextProvider>
                            : null}
                        </TabPanelItem>
                        <TabPanelItem title='Тестовый список'>
                            {activeTabIndex === 1 ?
                                <TestListContextProvider>
                                    <TestListTabPanelContent />
                                </TestListContextProvider>
                            : null}
                        </TabPanelItem>
                    </TabPanel>
                </div>
            </div>
        </>
    )
};

