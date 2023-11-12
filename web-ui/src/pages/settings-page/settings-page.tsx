import './settings-page.scss';

import { GraphIcon, ManageIcon, RegulatorIcon, RtcClockIcon, RtcIcon, ScheduleIcon, ServiceIcon, SettingsIcon } from '../../constants/app-icons';
import PageHeader from '../../components/page-header/page-header';
import AppConstants from '../../constants/app-constants';
import TabPanel, { Item as TabPanelItem } from 'devextreme-react/tab-panel';
import { ControlParametersForm, RegulationParametersForm, RtcDateTimeForm, ServiceForm, TemperatureGraphTabContent } from './tab-contents/index';
import { SettingPageContextProvider, useSettingPageContext } from './settings-page-context';
import { SchedulesTabContent } from './tab-contents/schedules/schedules-tab-content';
import { HeatingCircuitContent } from './tab-contents/heating-circuit-content/heating-circuit-content';
import { HeatingCircuitTypes } from '../../models/regulator-settings/enums/heating-circuit-type-model';
import { useMemo } from 'react';
import { IconTab } from '../../components/tab-utils/icon-tab';

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
                    <TabPanel
                        width={ '100%' }
                        height={ '65vh' }
                        swipeEnabled={ false }
                        loop>
                        <TabPanelItem title={ 'Общие' } tabRender={ (e) => <IconTab tab={ e } icon={ <SettingsIcon size={ 18 } /> } /> }>
                            <HeatingCircuitContent />
                        </TabPanelItem>
                        <TabPanelItem title={ 'Управление' } tabRender={ (e) => <IconTab tab={ e } icon={ <ManageIcon size={ 18 } /> } /> }>
                            <ControlParametersForm />
                        </TabPanelItem>

                        <TabPanelItem title={ 'Регулятор' } tabRender={ (e) => <IconTab tab={ e } icon={ <RegulatorIcon size={ 18 } /> } /> }>
                            <RegulationParametersForm  />
                        </TabPanelItem>

                        <TabPanelItem title={ 'Темп. график' } tabRender={ (e) => <IconTab tab={ e } icon={ <GraphIcon size={ 18 } /> } /> }>
                            <TemperatureGraphTabContent />
                        </TabPanelItem>

                        <TabPanelItem title={ 'Расписания' } tabRender={ (e) => <IconTab tab={ e } icon={ <ScheduleIcon size={ 18 } /> } /> }>
                            <SchedulesTabContent />
                        </TabPanelItem>

                        <TabPanelItem title={ 'Сервис' } tabRender={ (e) => <IconTab tab={ e } icon={ <ServiceIcon size={ 18 } /> } /> }>
                            <ServiceForm />
                        </TabPanelItem>

                        <TabPanelItem title={ 'Даты и время' } tabRender={ (e) => <IconTab tab={ e } icon={ <RtcClockIcon size={ 18 } /> } /> }>
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