import './debug-page.scss';
import AppConstants from '../../constants/app-constants';
import { InputOutputIcon, DebugIcon, AdcIcon, DacIcon, ManualModeIcon } from '../../constants/app-icons';
import PageHeader from '../../components/page-header/page-header';
import { useState } from 'react';
import { TabPanel, Item as TabPanelItem } from 'devextreme-react/tab-panel';
import { GpioTabContent } from './tab-contents/gpio-content/gpio-tab-content';
import { AdcTabContent } from './tab-contents/adc-content/adc-tab-content';
import { DebugPageContextProvider, useDebugPage } from './debug-page-content';
import { IconTab } from '../../components/tab-utils/icon-tab';
import { DacTabContent } from './tab-contents/dac-content/dac-tab-content';


const DebugPageInternal = () => {
    const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
    const { tabPanelRef, modeId } = useDebugPage();

    return (
        <>
            <PageHeader caption={ modeId === 1 ? 'Ручной режим' : 'Отладка' }>
                { modeId === 1 ? <ManualModeIcon size={ AppConstants.headerIconSize } /> : <DebugIcon size={ AppConstants.headerIconSize } /> }
            </PageHeader>

            <div className={ 'content-block' }>
                <div className={ 'dx-card responsive-paddings' }>
                    <TabPanel
                        ref={ tabPanelRef }
                        swipeEnabled={ false }
                        animationEnabled
                        width={ '100%' }
                        height={ AppConstants.pageHeight }
                        loop
                        onSelectedIndexChange={ (value: number) => {
                            setActiveTabIndex(value);
                        } }
                    >
                        <TabPanelItem
                            title={ modeId === 1 ? 'Дискретные выходы' : 'Ввод/вывод' }
                            tabRender={ (e) => <IconTab tab={ e } icon={ <InputOutputIcon size={ 18 } /> } /> }
                        >
                            {
                                activeTabIndex === 0
                                ? <GpioTabContent />
                                : null
                            }
                        </TabPanelItem>
                        <TabPanelItem
                            title={ modeId === 1 ? 'Датчики' : 'АЦП' }
                            tabRender={ (e) => <IconTab tab={ e } icon={ <AdcIcon size={ 18 } /> } /> }
                        >
                            {
                                activeTabIndex === 1
                                ? <AdcTabContent />
                                : null
                            }
                        </TabPanelItem>

                        <TabPanelItem
                            title={ modeId === 1 ? 'Аналоговые выходы' : 'ЦАП' }
                            tabRender={ (e) => <IconTab tab={ e } icon={ <DacIcon size={ 18 } /> } /> }
                        >
                            {
                                activeTabIndex === 2
                                ? <DacTabContent />
                                : null
                            }
                        </TabPanelItem>
                    </TabPanel>
                </div>
            </div>
        </>
    )
};

export const DebugPage = () => {
    return (
        <DebugPageContextProvider>
            <DebugPageInternal />
        </DebugPageContextProvider>
    )
}
