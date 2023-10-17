import './debug-page.scss';

import AppConstants from '../../constants/app-constants';
import { DebugIcon } from '../../constants/app-icons';
import PageHeader from '../../components/page-header/page-header';
import { useState } from 'react';
import { TabPanel, Item as TabPanelItem } from 'devextreme-react/tab-panel';
import { TestTabContent } from './tab-panel-contents/test-content/test-tab-content';
import { GpioTabContent } from './tab-panel-contents/gpio-content/gpio-tab-content';


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
                                <GpioTabContent />
                            : null}
                        </TabPanelItem>
                        <TabPanelItem title='Тестовый список'>
                            {activeTabIndex === 1 ?
                                <TestTabContent />
                            : null}
                        </TabPanelItem>
                    </TabPanel>
                </div>
            </div>
        </>
    )
};

