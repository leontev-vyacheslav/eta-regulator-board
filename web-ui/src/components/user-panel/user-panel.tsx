import { useMemo } from 'react';
import ContextMenu, { Position } from 'devextreme-react/context-menu';
import List from 'devextreme-react/list';
import { useAuth } from '../../contexts/auth';
import { useSharedArea } from '../../contexts/shared-area';
import { AdditionalMenuIcon, ExitIcon, UserIcon, WorkDateIcon, WorkDateTodayIcon } from '../../constants/app-icons';
import ContextMenuItem from '../context-menu-item/context-menu-item';
import { useAppSettings } from '../../contexts/app-settings';
import { UserPanelProps } from '../../models/user-panel-props';
import { ContextMenuItemItemModel } from '../../models/context-menu-item-props';

import './user-panel.scss';

export default function ({ menuMode }: UserPanelProps) {
    const { user } = useAuth();
    const { showWorkDatePicker, signOutWithConfirm } = useSharedArea();
    const { setWorkDateToday } = useAppSettings();
    const menuItems = useMemo(() => {
        return [
            {
                text: user?.email,
                renderIconItem: () => <UserIcon size={ 22 }/>,
                renderTextItem: (item: ContextMenuItemItemModel) => {
                    return (
                        <>
                            <span style={ {
                                width: 150,
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                display: 'inline-block',
                                verticalAlign: 'middle'
                            } } className="dx-menu-item-text">{ item.text }</span>
                        </>
                    )
                }
            },
            {
                text: 'Рабочая дата',
                renderIconItem: () => <WorkDateIcon size={ 18 }/>,
                onClick: () => {
                    showWorkDatePicker();
                }
            },
            {
                text: 'Сегодня',
                renderIconItem: () => <WorkDateTodayIcon size={ 18 }/>,
                onClick: () => {
                    setWorkDateToday();
                }
            },
            {
                text: 'Выход',
                renderIconItem: () => <ExitIcon size={ 18 }/>,
                onClick: () => {
                    signOutWithConfirm();
                }
            },
        ];
    }, [setWorkDateToday, showWorkDatePicker, signOutWithConfirm, user?.email]);

    return (
        <div className={ 'user-panel' }>
            { menuMode === 'context' && (
                    <div className={ 'user-info' }>
                        <div className={ 'image-container' }>
                            <AdditionalMenuIcon size={ 22 }/>
                        </div>
                    </div>
                )
            }
            { menuMode === 'context' && (
                <ContextMenu
                    itemRender={ (item) => <ContextMenuItem item={ item } /> }
                    items={ menuItems }
                    target={ '.user-button' }
                    showEvent={ 'dxclick' }
                    width={ 200 }
                    cssClass={ 'user-menu' }
                >
                    <Position my={ 'right top' } at={ 'right bottom' } />
                </ContextMenu>
            ) }
            { menuMode === 'list' && (
                <List
                    className={ 'dx-toolbar-menu-action' }
                    itemRender={ (item) => <ContextMenuItem item={ item } /> }
                    items={ menuItems }
                />
            ) }
        </div>
    );
}
