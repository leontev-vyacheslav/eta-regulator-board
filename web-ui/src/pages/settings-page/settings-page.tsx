import './settings-page.scss';

import { SettingsIcon } from '../../constants/app-icons';
import PageHeader from '../../components/page-header/page-header';
import AppConstants from '../../constants/app-constants';
import TabPanel, { Item as TabPanelItem } from 'devextreme-react/tab-panel';
import { ControlParametersForm, RegulatorParametersForm, ServiceForm, TemperatureGraphForm } from './forms/index';
import { SettingPageContextProvider } from './settings-page-context';

export const SettingsPage = () => {

    return (
        <>
            <PageHeader caption={ 'Настройки' }>
                <SettingsIcon size={ AppConstants.headerIconSize } />
            </PageHeader>
            <div className={ 'content-block' }>
                <div className={ 'dx-card responsive-paddings' }>
                    <SettingPageContextProvider>
                        <TabPanel width={ '100%' } loop>
                            <TabPanelItem title={ 'Управление' }>
                                <ControlParametersForm />
                            </TabPanelItem>

                            <TabPanelItem title={ 'Темп. график' }>
                                <TemperatureGraphForm />
                            </TabPanelItem>

                            <TabPanelItem title={ 'Регулятор' }>
                                <RegulatorParametersForm />
                            </TabPanelItem>

                            <TabPanelItem title={ 'Сервис' } >
                                <ServiceForm />
                            </TabPanelItem>
                        </TabPanel>
                    </SettingPageContextProvider>
                </div>
            </div>
        </>
    );
};
