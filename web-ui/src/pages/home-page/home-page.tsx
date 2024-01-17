import './home-page.scss';
import AppConstants from '../../constants/app-constants';
import { HomeIcon } from '../../constants/app-icons';
import PageHeader from '../../components/page-header/page-header';
import { TabPanel, Item as TabPanelItem } from 'devextreme-react/tab-panel'
import { useRef, useState } from 'react';
import { IconTab } from '../../components/tab-utils/icon-tab';
import { HeatingCircuitIndexModel } from '../../models/regulator-settings/enums/heating-circuit-type-model';
import { formatMessage } from 'devextreme/localization';
import { HeatingCircuitIconSelector } from '../../components/heating-circuit-icon-selector/heating-circuit-icon-selector';
import { HeatingCircuitSelector } from './mnemoschema-selector';
import { useRegulatorSettings } from '../../contexts/app-regulator-settings';

export const HomePage = () => {
    const { regulatorSettings, getHeatingCircuitName } = useRegulatorSettings();
    const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
    const tabPanelRef = useRef<TabPanel>(null);

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
                                title={ getHeatingCircuitName(HeatingCircuitIndexModel.first) }
                                tabRender={
                                    (e) => <IconTab tab={ e } icon={ <HeatingCircuitIconSelector heatingCircuitIndex={ HeatingCircuitIndexModel.first } /> } />
                                }
                            >
                                {
                                    activeTabIndex === HeatingCircuitIndexModel.first
                                        ? <HeatingCircuitSelector heatingCircuitIndex={ HeatingCircuitIndexModel.first } />
                                        : null
                                }
                            </TabPanelItem>

                            <TabPanelItem
                                title={ getHeatingCircuitName(HeatingCircuitIndexModel.second) }
                                tabRender={
                                    (e) => <IconTab tab={ e } icon={ <HeatingCircuitIconSelector heatingCircuitIndex={ HeatingCircuitIndexModel.second } /> } />
                                }
                            >
                                {
                                    activeTabIndex === HeatingCircuitIndexModel.second
                                        ? <HeatingCircuitSelector heatingCircuitIndex={ HeatingCircuitIndexModel.second } />
                                        : null
                                }
                            </TabPanelItem>
                        </TabPanel>
                        : <div className='dx-empty-message' style={ { height: AppConstants.pageHeight, } }>{formatMessage('dxCollectionWidget-noDataText')}</div>
                    }
                </div>
            </div>
        </>
    );
};
