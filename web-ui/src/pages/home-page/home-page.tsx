import './home-page.scss';
import AppConstants from '../../constants/app-constants';
import { HeatSysIcon, HomeIcon, HotWaterIcon } from '../../constants/app-icons';
import PageHeader from '../../components/page-header/page-header';
import { TabPanel, Item as TabPanelItem } from 'devextreme-react/tab-panel'
import { useRef, useState } from 'react';
import { IconTab } from '../../components/tab-utils/icon-tab';
import { HeatSysMnemoschema } from './tab-contents/heat-sys-content/heat-sys-mnemoschema';
import { HotWaterMnemoschema } from './tab-contents/hot-water-content/hot-water-mnemoschema';
import { ValveDirectionModel } from '../../models/regulator-settings/enums/valve-direction-model';

export const HomePage = () => {
    const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
    const tabPanelRef = useRef<TabPanel>(null);

    return (
        <>
            <PageHeader caption={ 'Главная' }>
                <HomeIcon size={ AppConstants.headerIconSize } />
            </PageHeader>
            <div className={ 'content-block' }>
                <div className={ 'dx-card responsive-paddings home-page-content' }>
                    <TabPanel ref={ tabPanelRef }
                        swipeEnabled={ false }
                        width={ '100%' }
                        height={ AppConstants.pageHeight }
                        loop
                        onSelectedIndexChange={ (value: number) => {
                            setActiveTabIndex(value);
                        } }>

                        <TabPanelItem title='Контур ЦО' tabRender={ (e) => <IconTab tab={ e } icon={ <HeatSysIcon size={ 18 } /> } /> } >
                            {
                                activeTabIndex === 0
                                    ? <HeatSysMnemoschema
                                        pumpOn={ true }
                                        supplyPipeTemperature={ 110.5 }
                                        returnPipeTemperature={ 90.35 }
                                        outdoorTemperature={ -18.5 }
                                        valvePosition={ 53.5 }
                                        valveDirection={ ValveDirectionModel.down }
                                    />
                                    : null
                            }
                        </TabPanelItem>

                        <TabPanelItem title='Контур ГВС' tabRender={ (e) => <IconTab tab={ e } icon={ <HotWaterIcon size={ 18 } /> } /> } >
                            {
                                activeTabIndex === 1
                                    ? <HotWaterMnemoschema
                                        pumpOn={ false }
                                        supplyPipeTemperature={ 93.6 }
                                        returnPipeTemperature={ 66.5 }
                                        valvePosition={ 67.8 }
                                        valveDirection={ ValveDirectionModel.up }
                                    />
                                    : null
                            }
                        </TabPanelItem>
                    </TabPanel>
                </div>
            </div>
        </>
    );
};
