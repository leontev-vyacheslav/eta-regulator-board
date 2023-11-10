import './debug-page.scss';

import AppConstants from '../../constants/app-constants';
import { DebugIcon } from '../../constants/app-icons';
import PageHeader from '../../components/page-header/page-header';
import { useState } from 'react';
import { TabPanel, Item as TabPanelItem } from 'devextreme-react/tab-panel';
import { GpioTabContent } from './tab-contents/gpio-content/gpio-tab-content';
import { AdcTabContent } from './tab-contents/adc-content/adc-tab-content';


export const DebugPage = () => {
    const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

    return (
        <>
            <PageHeader caption={ 'Ручной режим' }>
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
                        <TabPanelItem title='АЦП'>
                        {activeTabIndex === 1 ?
                            <AdcTabContent />
                             : null}
                        </TabPanelItem>

                    </TabPanel>
                </div>
            </div>
        </>
    )
};

