import { useMemo } from 'react';
import ContextMenu, { Position } from 'devextreme-react/context-menu';
import List from 'devextreme-react/list';
import { useSharedArea } from '../../contexts/shared-area';
import { AdditionalMenuIcon, ExitIcon, WorkDateIcon } from '../../constants/app-icons';
import ContextMenuItem from '../context-menu-item/context-menu-item';
import { UserPanelProps } from '../../models/user-panel-props';

import './user-panel.scss';

export default function ({ menuMode }: UserPanelProps) {

    const { showWorkDatePicker, signOutWithConfirm } = useSharedArea();
    const menuItems = useMemo(() => {
        return [
            {
                text: 'Рабочая дата',
                renderIconItem: () => <WorkDateIcon size={ 18 }/>,
                onClick: () => {
                    showWorkDatePicker();
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
    }, [showWorkDatePicker, signOutWithConfirm]);

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
