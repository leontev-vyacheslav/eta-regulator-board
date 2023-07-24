import './footer.scss';
import { useAppSettings } from '../../contexts/app-settings';

export default ({ ...rest }) => {
    const { appSettingsData: { isShowFooter: isShowFooter } } = useAppSettings();
    return isShowFooter ? <footer className={ 'footer' } { ...rest } /> : null;
};
