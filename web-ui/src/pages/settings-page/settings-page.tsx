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
                            <TabPanelItem title={ 'Общие' } tabRender={ (e) => {
                            return (
                                <div style={ { display: 'flex', alignItems: 'center', gap: 3 } }>
                                    <SettingsIcon size={ 18 } />
                                    <span>{e.title}</span>
                                </div>
                            );
                        } }>
                                <HeatingCircuitContent />
                            </TabPanelItem>
                            <TabPanelItem title={ 'Управление' } tabRender={ (e) => {
                            return (
                                <div style={ { display: 'flex', alignItems: 'center', gap: 3 } }>
                                    <ManageIcon size={ 18 } />
                                    <span>{e.title}</span>
                                </div>
                            );
                        } }>
                                <ControlParametersForm />
                            </TabPanelItem>

                            <TabPanelItem title={ 'Регулятор' } tabRender={ (e) => {
                            return (
                                <div style={ { display: 'flex', alignItems: 'center', gap: 3 } }>
                                    <RegulatorIcon size={ 18 } />
                                    <span>{e.title}</span>
                                </div>
                            );
                        } }>
                                <RegulationParametersForm  />
                            </TabPanelItem>

                            <TabPanelItem title={ 'Темп. график' } tabRender={ (e) => {
                            return (
                                <div style={ { display: 'flex', alignItems: 'center', gap: 3 } }>
                                    <GraphIcon size={ 18 } />
                                    <span>{e.title}</span>
                                </div>
                            );
                        } }>
                                <TemperatureGraphTabContent />
                            </TabPanelItem>

                            <TabPanelItem title={ 'Расписания' } tabRender={ (e) => {
                            return (
                                <div style={ { display: 'flex', alignItems: 'center', gap: 3 } }>
                                    <ScheduleIcon size={ 18 } />
                                    <span>{e.title}</span>
                                </div>
                            );
                        } }>
                                <SchedulesTabContent />
                            </TabPanelItem>

                            <TabPanelItem title={ 'Сервис' } tabRender={ (e) => {
                            return (
                                <div style={ { display: 'flex', alignItems: 'center', gap: 3 } }>
                                    <ServiceIcon size={ 18 } />
                                    <span>{e.title}</span>
                                </div>
                            );
                        } }>
                                <ServiceForm />
                            </TabPanelItem>

                            <TabPanelItem title={ 'Даты и время' } tabRender={ (e) => {
                            return (
                                <div style={ { display: 'flex', alignItems: 'center', gap: 3 } }>
                                    <RtcClockIcon size={ 18 } />
                                    <span>{e.title}</span>
                                </div>
                            );
                        } }>
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