import { SettingsIcon } from '../../constants/app-icons';
import PageHeader from '../../components/page-header/page-header';
import SettingsForm from '../../components/settings-form/settings-form';
import AppConstants from '../../constants/app-constants';

export default () => {
    return (
        <>
            <PageHeader caption={ 'Настройки' }>
                <SettingsIcon size={ AppConstants.headerIconSize }/>
            </PageHeader>
            <div className={ 'content-block' }>
                <div className={ 'dx-card responsive-paddings' }>
                    <SettingsForm style={ { width: 600 } }/>
                </div>
            </div>
        </>
    );
};
