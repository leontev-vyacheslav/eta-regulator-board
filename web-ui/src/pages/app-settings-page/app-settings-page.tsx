import { TabPanel, Item as TabPanelItem } from 'devextreme-react/tab-panel';
import PageHeader from '../../components/page-header/page-header';
import AppConstants from '../../constants/app-constants';
import { RtcClockIcon, ServiceIcon, AppSettingsIcon } from '../../constants/app-icons';
import { IconTab } from '../../components/tab-utils/icon-tab';

export const AppSettingsPage = () => {
    return (
        <>
            <PageHeader caption={ 'Приложение' }>
                <AppSettingsIcon size={ AppConstants.headerIconSize } />
            </PageHeader>
            <div className={ 'content-block' }>
                <div className={ 'dx-card responsive-paddings' }>
                    <TabPanel

                        width={ '100%' }
                        height={ AppConstants.pageHeight }
                        swipeEnabled={ false }
                        loop>

                        <TabPanelItem  title={ 'Сервис' } tabRender={ (e) => <IconTab tab={ e } icon={ <ServiceIcon size={ 18 } /> } /> }>
                            {/* <ServiceForm /> */}
                        </TabPanelItem>

                        <TabPanelItem title={ 'Даты и время' } tabRender={ (e) => <IconTab tab={ e } icon={ <RtcClockIcon size={ 18 } /> } /> }>
                            {/* <RtcDateTimeForm /> */}
                        </TabPanelItem>
                    </TabPanel>
                </div>
            </div>
        </>
    );
};
