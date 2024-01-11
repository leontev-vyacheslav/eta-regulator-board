import './home-page.scss';
import AppConstants from '../../constants/app-constants';
import { HeatSysIcon, HomeIcon, HotWaterIcon, VentilationIcon } from '../../constants/app-icons';
import PageHeader from '../../components/page-header/page-header';
import { TabPanel, Item as TabPanelItem } from 'devextreme-react/tab-panel'
import { useRef, useState } from 'react';
import { IconTab } from '../../components/tab-utils/icon-tab';
import { HeatSysMnemoschema } from './tab-contents/heat-sys-content/heat-sys-mnemoschema';
import { HotWaterMnemoschema } from './tab-contents/hot-water-content/hot-water-mnemoschema';
import { ValveDirectionModel } from '../../models/regulator-settings/enums/valve-direction-model';
import { useAppSettings } from '../../contexts/app-settings';
import { HeatingCircuitTypeModel } from '../../models/regulator-settings/enums/heating-circuit-type-model';

export const HomePage = () => {
    const { regulatorSettings } = useAppSettings();
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

                        <TabPanelItem
                            title={ regulatorSettings?.heatingCircuits.items[0].name }

                            tabRender={ (e) => <IconTab tab={ e } icon={
                                regulatorSettings?.heatingCircuits.items[0].type === HeatingCircuitTypeModel.heating
                                ? <HeatSysIcon size={ 18 }  />
                                : regulatorSettings?.heatingCircuits.items[0].type === HeatingCircuitTypeModel.hotWater
                                    ? <HotWaterIcon size={ 18 } />
                                    : <VentilationIcon size={ 18 } />
                                } />
                            }
                        >
                            {
                                activeTabIndex === 0
                                    ? regulatorSettings?.heatingCircuits.items[0].type !== HeatingCircuitTypeModel.hotWater ? <HeatSysMnemoschema
                                        pumpOn={ true }
                                        supplyPipeTemperature={ 110.5 }
                                        returnPipeTemperature={ 90.35 }
                                        outdoorTemperature={ -18.5 }
                                        valvePosition={ 53.5 }
                                        valveDirection={ ValveDirectionModel.down }
                                    /> : <HotWaterMnemoschema
                                    pumpOn={ true }
                                    supplyPipeTemperature={ 93.6 }
                                    returnPipeTemperature={ 66.5 }
                                    valvePosition={ 67.8 }
                                    valveDirection={ ValveDirectionModel.up }
                                    />
                                    : null
                            }
                        </TabPanelItem>

                        <TabPanelItem
                            title={ regulatorSettings?.heatingCircuits.items[1].name }
                            tabRender={ (e) => <IconTab tab={ e } icon={
                                regulatorSettings?.heatingCircuits.items[1].type === HeatingCircuitTypeModel.heating
                                ? <HeatSysIcon size={ 18 }  />
                                : regulatorSettings?.heatingCircuits.items[1].type === HeatingCircuitTypeModel.hotWater
                                    ? <HotWaterIcon size={ 18 } />
                                    : <VentilationIcon size={ 18 } />
                                } />
                            }
                            >
                            {
                                activeTabIndex === 1
                                    ? regulatorSettings?.heatingCircuits.items[1].type === HeatingCircuitTypeModel.hotWater ? <HotWaterMnemoschema
                                        pumpOn={ true }
                                        supplyPipeTemperature={ 93.6 }
                                        returnPipeTemperature={ 66.5 }
                                        valvePosition={ 67.8 }
                                        valveDirection={ ValveDirectionModel.up }
                                    /> : <HeatSysMnemoschema
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
                    </TabPanel>
                </div>
            </div>
        </>
    );
};
