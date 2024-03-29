import { TabPanel, Item as TabPanelItem } from 'devextreme-react/tab-panel';
import PageHeader from '../../components/page-header/page-header';
import AppConstants from '../../constants/app-constants';
import { RtcClockIcon, ServiceIcon, AppIcon, InfoIcon, UsersIcon } from '../../constants/app-icons';
import { IconTab } from '../../components/tab-utils/icon-tab';
import { InformationForm } from './tab-contents/information-content/information-content';
import { RtcDateTimeForm } from '../settings-page/tab-contents';
import { ServiceForm } from './tab-contents/service-content/service-content';
import { AccountsGrid } from './tab-contents/accounts-content/accounts-content';

import './../settings-page/settings-page.scss';


export const AppSettingsPage = () => {
    return (
        <>
            <PageHeader caption={ 'Приложение' }>
                <AppIcon size={ AppConstants.headerIconSize } />
            </PageHeader>
            <div className={ 'content-block' }>
                <div className={ 'dx-card responsive-paddings' }>
                    <TabPanel
                        width={ '100%' }
                        height={ AppConstants.pageHeight }
                        swipeEnabled={ false }
                        animationEnabled
                        loop
                    >
                        <TabPanelItem title={ 'Информация' } tabRender={ (e) => <IconTab tab={ e } icon={ <InfoIcon size={ 18 } /> } /> }>
                            <InformationForm />
                        </TabPanelItem>
                        <TabPanelItem title={ 'Даты и время' } tabRender={ (e) => <IconTab tab={ e } icon={ <RtcClockIcon size={ 18 } /> } /> }>
                            <RtcDateTimeForm />
                        </TabPanelItem>
                        <TabPanelItem title={ 'Сервис' } tabRender={ (e) => <IconTab tab={ e } icon={ <ServiceIcon size={ 18 } /> } /> }>
                            <ServiceForm />
                        </TabPanelItem>
                        <TabPanelItem title={ 'Учетные записи' } tabRender={ (e) => <IconTab tab={ e } icon={ <UsersIcon size={ 18 } /> } /> }>
                            <AccountsGrid />
                        </TabPanelItem>
                    </TabPanel>
                </div>
            </div>
        </>
    );
};
