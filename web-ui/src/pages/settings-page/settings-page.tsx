import './settings-page.scss';

import { SettingsIcon } from '../../constants/app-icons';
import PageHeader from '../../components/page-header/page-header';
import AppConstants from '../../constants/app-constants';
import TabPanel, { Item as TabPanelItem } from 'devextreme-react/tab-panel';
import { ControlParametersForm, RegulationParametersForm, RtcDateTimeForm, ServiceForm, TemperatureGraphTabContent } from './tab-contents/index';
import { SettingPageContextProvider } from './settings-page-context';
import { SchedulesTabContent } from './tab-contents/schedules/schedules-tab-content';

export const SettingsPage = () => {

    return (
        <>
            <PageHeader caption={ 'Настройки' }>
                <SettingsIcon size={ AppConstants.headerIconSize } />
            </PageHeader>
            <div className={ 'content-block' }>
                <div className={ 'dx-card responsive-paddings' }>
                    <SettingPageContextProvider>
                        <TabPanel width={ '100%' }  height={ '65vh' } loop>
                            <TabPanelItem title={ 'Управление' }>
                                <ControlParametersForm />
                            </TabPanelItem>

                            <TabPanelItem title={ 'Регулятор' }>
                                <RegulationParametersForm />
                            </TabPanelItem>

                            <TabPanelItem title={ 'Темп. график' }>
                                <TemperatureGraphTabContent />
                            </TabPanelItem>

                            <TabPanelItem title={ 'Расписания' }>
                                <SchedulesTabContent />
                            </TabPanelItem>

                            <TabPanelItem title={ 'Сервис' } >
                                <ServiceForm />
                            </TabPanelItem>

                            <TabPanelItem title={ 'Даты и время' }>
                                <RtcDateTimeForm />
                            </TabPanelItem>
                        </TabPanel>
                    </SettingPageContextProvider>
                </div>
            </div>
        </>
    );
};
