import './settings-page.scss';

import { AdditionalMenuIcon, DownloadIcon, GraphIcon, ManageIcon, RegulatorIcon, ResetIcon, RtcClockIcon,  ScheduleIcon, ServiceIcon, SettingsIcon } from '../../constants/app-icons';
import PageHeader from '../../components/page-header/page-header';
import AppConstants from '../../constants/app-constants';
import TabPanel, { Item as TabPanelItem } from 'devextreme-react/tab-panel';
import { ControlParametersForm, RegulationParametersForm, RtcDateTimeForm, ServiceForm, TemperatureGraphTabContent } from './tab-contents/index';
import { SettingPageContextProvider, useSettingPageContext } from './settings-page-context';
import { SchedulesTabContent } from './tab-contents/schedules/schedules-tab-content';
import { HeatingCircuitContent } from './tab-contents/heating-circuit-content/heating-circuit-content';
import { HeatingCircuitTypeModel, HeatingCircuitTypes } from '../../models/regulator-settings/enums/heating-circuit-type-model';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { IconTab } from '../../components/tab-utils/icon-tab';
import { useAppData } from '../../contexts/app-data/app-data';
import { MenuItemModel } from '../../models/menu-item-model';
import { formatMessage } from 'devextreme/localization';
import { showConfirmDialog } from '../../utils/dialogs';

export const SettingsPageInternal = () => {
    const { heatingCircuitType, circuitId, applyDefaultHeatCircuitSettingsAsync } = useSettingPageContext();
    const { getRegulatorSettingsAsFile } = useAppData();
    const tabPanelRef = useRef<TabPanel>(null);

    const pageHeaderTitle = useMemo(() => {
        const currentCircuitId = circuitId + 1;

        if (!heatingCircuitType) {
            return `Настройки контура ${currentCircuitId}`;
        }
        const currentHeatingCircuitType = HeatingCircuitTypes.find(t => t.id === heatingCircuitType);

        return `Настройки контура ${currentCircuitId} (${currentHeatingCircuitType!.shotDescription})`;

    }, [circuitId, heatingCircuitType]);

    const downloadRegulatorSettingsAsync = useCallback(async () => {
        const data = await getRegulatorSettingsAsFile();

        if (!data) {
            return;
        };

        const href = URL.createObjectURL(data);

        const anchorElement = document.createElement('a');
        anchorElement.href = href;
        anchorElement.setAttribute('download', 'regulator_settings.json');
        document.body.appendChild(anchorElement);
        anchorElement.click();

        document.body.removeChild(anchorElement);

        setTimeout(() => {
            URL.revokeObjectURL(href);
        }, 100);
    }, [getRegulatorSettingsAsFile]);

    const resetRegulatorSettingsAsync = useCallback(async () => {

        const innerCallback = async () => {
            await applyDefaultHeatCircuitSettingsAsync(heatingCircuitType!);
        };

        showConfirmDialog({
            title: formatMessage('confirm-title'),
            iconName: 'ResetIcon',
            iconSize: 32,
            callback: innerCallback,
            textRender: () => {
                return <> {formatMessage('confirm-dialog-reset-heating-circuit-settings')} </>;
            }
        });


    }, [applyDefaultHeatCircuitSettingsAsync, heatingCircuitType]);

    const menuItems = useMemo(() => {
        return [
            {
                icon: () => <AdditionalMenuIcon size={ 20 } color='black' />,
                items: [
                    {
                        text: 'Сброс настроек контура...',
                        icon: () => <ResetIcon size={ 20 } />,
                        onClick: resetRegulatorSettingsAsync
                    },
                    {
                        text: 'Выгрузить все настройки',
                        icon: () => <DownloadIcon size={ 20 } />,
                        onClick: downloadRegulatorSettingsAsync
                    }
                ]
            }
        ] as MenuItemModel[];
    }, [resetRegulatorSettingsAsync, downloadRegulatorSettingsAsync]);

    useEffect(() => {
        const temperatureGraphTabHtmlElement: HTMLDivElement | null = document.querySelector('.dx-item.dx-tab:has(* #temperature-graph-tab-icon)');

        if (temperatureGraphTabHtmlElement) {
            if(heatingCircuitType === HeatingCircuitTypeModel.hotWater) {
                temperatureGraphTabHtmlElement.style.display =  'none';
            } else {
                temperatureGraphTabHtmlElement.style.removeProperty('display');
            }
        }

        if(heatingCircuitType === HeatingCircuitTypeModel.hotWater) {
            const selectedIndexTab = tabPanelRef.current?.instance.option('selectedIndex');
            if(selectedIndexTab === 3) {
                tabPanelRef.current?.instance.option('selectedIndex', 0);
            }
        }
    }, [heatingCircuitType]);

    return (
        <>
            <PageHeader caption={ pageHeaderTitle } menuItems={ menuItems }>
                <SettingsIcon size={ AppConstants.headerIconSize } />
            </PageHeader>
            <div className={ 'content-block' }>
                <div className={ 'dx-card responsive-paddings' }>
                    <TabPanel
                        ref={ tabPanelRef }
                        width={ '100%' }
                        height={ AppConstants.pageHeight }
                        swipeEnabled={ false }
                        loop>
                        <TabPanelItem title={ 'Общие' } tabRender={ (e) => <IconTab tab={ e } icon={ <SettingsIcon size={ 18 } /> } /> }>
                            <HeatingCircuitContent />
                        </TabPanelItem>

                        <TabPanelItem title={ 'Управление' } tabRender={ (e) => <IconTab tab={ e } icon={ <ManageIcon size={ 18 } /> } /> }>
                            <ControlParametersForm />
                        </TabPanelItem>

                        <TabPanelItem title={ 'Регулятор' } tabRender={ (e) => <IconTab tab={ e } icon={ <RegulatorIcon size={ 18 } /> } /> }>
                            <RegulationParametersForm />
                        </TabPanelItem>

                        <TabPanelItem title={ 'Темп. график' } tabRender={ (e) => <IconTab tab={ e } icon={ <GraphIcon id='temperature-graph-tab-icon' size={ 18 }  /> } /> }>
                            <TemperatureGraphTabContent />
                        </TabPanelItem>

                        <TabPanelItem title={ 'Расписания' } tabRender={ (e) => <IconTab tab={ e } icon={ <ScheduleIcon size={ 18 } /> } /> }>
                            <SchedulesTabContent />
                        </TabPanelItem>

                        <TabPanelItem  title={ 'Сервис' } tabRender={ (e) => <IconTab tab={ e } icon={ <ServiceIcon size={ 18 } /> } /> }>
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