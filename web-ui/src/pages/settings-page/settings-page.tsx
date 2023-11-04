import './settings-page.scss';

import { SettingsIcon } from '../../constants/app-icons';
import PageHeader from '../../components/page-header/page-header';
import AppConstants from '../../constants/app-constants';
import TabPanel, { Item as TabPanelItem } from 'devextreme-react/tab-panel';
import { ControlParametersForm, RegulationParametersForm, RtcDateTimeForm, ServiceForm, TemperatureGraphTabContent } from './tab-contents/index';
import { SettingPageContextProvider, useSettingPageContext } from './settings-page-context';
import { SchedulesTabContent } from './tab-contents/schedules/schedules-tab-content';
import { HeatingCircuitContent } from './tab-contents/heating-circuit-content/heating-circuit-content';
import { HeatingCircuitTypes } from '../../models/regulator-settings/enums/heating-circuit-type-model';
import { useMemo } from 'react';

export const SettingsPageInternal = () => {
    const { heatingCircuitType, circuitId } = useSettingPageContext();

    const pageHeaderTitle = useMemo (() => {
        const currentCircuitId = circuitId +  1;

        if (!heatingCircuitType) {
            return `Настройки контура ${currentCircuitId}`;
        }
        const currentHeatingCircuitType = HeatingCircuitTypes.find(t => t.id === heatingCircuitType);

        return `Настройки контура ${currentCircuitId} (${currentHeatingCircuitType!.shotDescription})`;

    }, [circuitId, heatingCircuitType]);

    return (
            <>
            <PageHeader caption={ pageHeaderTitle }>
                <SettingsIcon size={ AppConstants.headerIconSize } />
            </PageHeader>
            <div className={ 'content-block' }>
                <div className={ 'dx-card responsive-paddings' }>
                        <TabPanel width={ '100%' }  height={ '65vh' } loop>
                            <TabPanelItem title={ 'Общие' } >
                                <HeatingCircuitContent />
                            </TabPanelItem>
                            <TabPanelItem title={ 'Управление' }>
                                <ControlParametersForm />
                            </TabPanelItem>

                            <TabPanelItem title={ 'Регулятор' }>
                                <RegulationParametersForm  />
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
                </div>
            </div>
        </>
    );
};


export const SettingsPage = () => {
    return (
        <SettingPageContextProvider>
            <SettingsPageInternal />
        </SettingPageContextProvider>
    )
}