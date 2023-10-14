import './settings-page.scss';

import { SettingsIcon } from '../../constants/app-icons';
import PageHeader from '../../components/page-header/page-header';
import AppConstants from '../../constants/app-constants';
import TabPanel, { Item as TabPanelItem } from 'devextreme-react/tab-panel';
import { ControlParametersForm } from './control-parameters-form';
import { InfoForm } from './info-form';
import { TemperatureGraphForm } from './temperture-graph-form';
import { ServiceForm } from './service-form';
import { RegulatorParametersForm } from './regulator-parameters-form';

export const SettingsPage = () => {
    return (
        <>
            <PageHeader caption={ 'Настройки' }>
                <SettingsIcon size={ AppConstants.headerIconSize } />
            </PageHeader>
            <div className={ 'content-block' }>
                <div className={ 'dx-card responsive-paddings' }>
                    <TabPanel width={ '100%' } loop>
                        <TabPanelItem title={ 'Информация' } >
                            <InfoForm />
                        </TabPanelItem>

                        <TabPanelItem title={ 'Управление' }>
                            <ControlParametersForm />
                        </TabPanelItem>

                        <TabPanelItem title='Сервис'>
                            <ServiceForm />
                        </TabPanelItem>

                        <TabPanelItem title={ 'Темп. график' }>
                            <TemperatureGraphForm />
                        </TabPanelItem>

                        <TabPanelItem title={ 'Состояние' } >
                            <ServiceForm />
                        </TabPanelItem>

                        <TabPanelItem title={ 'Регулятор' }>
                            <RegulatorParametersForm />
                        </TabPanelItem>
                    </TabPanel>
                </div>
            </div>
        </>
    );
};
