import Toolbar, { Item } from 'devextreme-react/toolbar';
import Button from 'devextreme-react/button';
import UserPanel from '../user-panel/user-panel';
import { Template } from 'devextreme-react/core/template';
import { ReactComponent as AppLogo } from '../../assets/app-logo.svg';
import { useAppSettings } from '../../contexts/app-settings';
import { MenuIcon } from '../../constants/app-icons';
import { WorkDateWidgetProps } from '../../models/work-date-widget-props';
import { HeaderProps } from '../../models/header-props';

import './header.scss';

const Header = ({ title, menuToggleEnabled,  toggleMenu } : HeaderProps) => {
    const { appSettingsData } = useAppSettings();

    const WorkDateWidget = ( { outerStyle }: WorkDateWidgetProps) => {
        return (
            <div style={ {
                ...outerStyle, ...{
                    fontSize: 14,
                    marginTop: 3,
                    fontWeight: 'bold',
                    display: 'flex',
                    flexDirection: 'column',
                    lineHeight: 'initial',
                    alignItems: 'flex-start'
                }
            } }>
                <div> { appSettingsData.workDate.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: 'numeric' }) }</div>
            </div>
        ) ;
    };

    return (
        <header className={ 'header-component' }>
            <Toolbar className={ 'header-toolbar' }>
                <Item visible={ menuToggleEnabled } location={ 'before' } widget={ 'dxButton' } cssClass={ 'menu-button' }>
                    <Button icon={ 'none' } onClick={ toggleMenu }>
                        <MenuIcon size={ 30 }/>
                    </Button>
                </Item>
                <Item
                    location={ 'before' }
                    cssClass={ 'header-title' }
                    text={ title }
                    visible={ !!title }
                    render={ () => {
                        return (
                            <div className={ 'header-title-logo-container' }>
                                <AppLogo width={ 60 }/>
                                <div>{ title }</div>
                            </div>
                        );
                    } }
                />
                <Item location={ 'after' } locateInMenu={ 'auto' } menuItemTemplate={ 'workDayWidgetTemplate' } >
                    <WorkDateWidget />
                </Item>
                {/* <Item location={ 'after' } locateInMenu={ 'auto' } menuItemTemplate={ 'userPanelTemplate' }>
                    <Button className={ 'user-button authorization' } stylingMode={ 'text' }>
                        <UserPanel menuMode={ 'context' }/>
                    </Button>
                </Item> */}

                <Template name={ 'userPanelTemplate' }>
                    <UserPanel menuMode={ 'list' }/>
                </Template>
                <Template name={ 'workDayWidgetTemplate' }>
                    <div style={ { display: 'flex', alignItems: 'center', /*borderBottomColor: '#d8d8d8', borderBottomWidth: 1, borderBottomStyle: 'solid' */  } } className={ 'dx-item-content dx-list-item-content' }>
                        <span className={ 'dx-icon dx-icon-info dx-list-item-icon' }/>
                        <WorkDateWidget outerStyle={ { marginLeft: 15 } }/>
                    </div>
                </Template>
            </Toolbar>
        </header>
    )
}

export default Header;
