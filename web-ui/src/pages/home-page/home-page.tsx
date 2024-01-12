import './home-page.scss';
import AppConstants from '../../constants/app-constants';
import { HeatSysIcon, HomeIcon, HotWaterIcon, VentilationIcon } from '../../constants/app-icons';
import PageHeader from '../../components/page-header/page-header';
import { TabPanel, Item as TabPanelItem } from 'devextreme-react/tab-panel'
import { useCallback, useRef, useState } from 'react';
import { IconTab } from '../../components/tab-utils/icon-tab';
import { HeatSysMnemoschema } from './tab-contents/heat-sys-content/heat-sys-mnemoschema';
import { HotWaterMnemoschema } from './tab-contents/hot-water-content/hot-water-mnemoschema';
import { ValveDirectionModel } from '../../models/regulator-settings/enums/valve-direction-model';
import { useAppSettings } from '../../contexts/app-settings';
import { HeatingCircuitIndexModel, HeatingCircuitTypeModel } from '../../models/regulator-settings/enums/heating-circuit-type-model';
import { formatMessage } from 'devextreme/localization';

export const HomePage = () => {
    const { regulatorSettings, getHeatingCircuitName } = useAppSettings();
    const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
    const tabPanelRef = useRef<TabPanel>(null);

    const iconRender = useCallback((index: HeatingCircuitIndexModel) => {
        let icon: JSX.Element | undefined;

        switch (regulatorSettings?.heatingCircuits.items[index].type) {
            case HeatingCircuitTypeModel.heating:
                icon = <HeatSysIcon size={ 18 } />
                break;
            case HeatingCircuitTypeModel.hotWater:
                icon = <HotWaterIcon size={ 18 } />
                break;
            case HeatingCircuitTypeModel.ventilation:
                icon = <VentilationIcon size={ 18 } />
                break;
        }

        return icon;
    }, [regulatorSettings?.heatingCircuits.items]);

    const mnemoschemaRender = useCallback((index: HeatingCircuitIndexModel) => {
        let mnemoschema: JSX.Element | undefined;

        switch (regulatorSettings?.heatingCircuits.items[index].type) {
            case HeatingCircuitTypeModel.heating:
            case HeatingCircuitTypeModel.ventilation:
                mnemoschema = <HeatSysMnemoschema
                    pumpOn={ true }
                    supplyPipeTemperature={ 110.5 }
                    returnPipeTemperature={ 90.35 }
                    outdoorTemperature={ -18.5 }
                    valvePosition={ 53.5 }
                    valveDirection={ ValveDirectionModel.down }
                />
                break;
            case HeatingCircuitTypeModel.hotWater:
                mnemoschema = <HotWaterMnemoschema
                    pumpOn={ true }
                    supplyPipeTemperature={ 93.6 }
                    returnPipeTemperature={ 66.5 }
                    valvePosition={ 67.8 }
                    valveDirection={ ValveDirectionModel.up }
                />
                break;
        }

        return mnemoschema;
    }, [regulatorSettings?.heatingCircuits.items]);

    return (
        <>
            <PageHeader caption={ 'Главная' }>
                <HomeIcon size={ AppConstants.headerIconSize } />
            </PageHeader>
            <div className={ 'content-block' }>
                <div className={ 'dx-card responsive-paddings home-page-content' }>
                    {regulatorSettings ?
                        <TabPanel ref={ tabPanelRef }
                            swipeEnabled={ false }
                            width={ '100%' }
                            height={ AppConstants.pageHeight }
                            loop
                            onSelectedIndexChange={ (value: number) => {
                                setActiveTabIndex(value);
                            } }>

                            <TabPanelItem
                                title={ getHeatingCircuitName(HeatingCircuitIndexModel.firstCircuit) }
                                tabRender={ (e) => <IconTab tab={ e } icon={ iconRender(HeatingCircuitIndexModel.firstCircuit) } /> }
                            >
                                {activeTabIndex === HeatingCircuitIndexModel.firstCircuit ? mnemoschemaRender(HeatingCircuitIndexModel.firstCircuit) : null}
                            </TabPanelItem>

                            <TabPanelItem
                                title={ getHeatingCircuitName(HeatingCircuitIndexModel.secondCircuit) }
                                tabRender={ (e) => <IconTab tab={ e } icon={ iconRender(HeatingCircuitIndexModel.secondCircuit) } /> }
                            >
                                {activeTabIndex === HeatingCircuitIndexModel.secondCircuit ? mnemoschemaRender(HeatingCircuitIndexModel.secondCircuit) : null}
                            </TabPanelItem>
                        </TabPanel>
                        : <div className='dx-empty-message' style={ { height: AppConstants.pageHeight, } }>{formatMessage('dxCollectionWidget-noDataText')}</div>
                    }
                </div>
            </div>
        </>
    );
};
