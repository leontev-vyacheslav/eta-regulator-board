import { useCallback, useEffect, useMemo, useRef } from 'react';
import TreeView from 'devextreme-react/tree-view';
import * as events from 'devextreme/events';
import { navigation } from '../../constants/app-navigation';
import { useNavigation } from '../../contexts/navigation';
import { useScreenSize } from '../../utils/media-query';
import { useSharedArea } from '../../contexts/shared-area';
import { useAuth } from '../../contexts/auth';
import { TreeViewItemModel } from '../../models/tree-view-item';
import { SideNavigationMenuProps } from '../../models/side-navigation-menu-props';

import './side-navigation-menu.scss';

export default function SideNavigationMenu (props: SideNavigationMenuProps) {
    const {
        children,
        selectedItemChanged,
        openMenu,
        compactMode,
        onMenuReady
    } = props;

    const { isLarge } = useScreenSize();
    const { showWorkDatePicker, signOutWithConfirm, treeViewRef } = useSharedArea();
    const { navigationData: { currentPath } } = useNavigation();
    const { user } = useAuth();

    const wrapperRef = useRef();

    function normalizePath () {
        return navigation
            .filter(i => !i.restricted || (i.restricted && user?.organizationId === null) )
            .map((item) => {
                if (item.path && !( /^\//.test(item.path) )) {
                    item.path = `/${ item.path }`;
                }
                if(item.items) {
                    item.items = item.items.filter(i => !i.restricted || (i.restricted && user?.organizationId === null))
                }
                return { ...item, expanded: isLarge } as TreeViewItemModel
            });
    }

    const items: TreeViewItemModel[] = useMemo<TreeViewItemModel[]>(
        normalizePath,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const getWrapperRef = useCallback((element) => {
        const prevElement = wrapperRef.current;
        if (prevElement) {
            events.off(prevElement, 'dxclick');
        }
        wrapperRef.current = element;
        events.on(element, 'dxclick', () => {
            openMenu();
        });
    }, [openMenu]);

    useEffect(() => {
      (async () => {
        const treeView = treeViewRef.current?.instance;
        if (treeView) {
          if (currentPath !== undefined) {
            treeView.selectItem(currentPath as any);
            try {
              await treeView.expandItem(currentPath as any);
            } catch (ex) {
              //
            }
          }
          if (compactMode) {
            treeView.collapseAll();
          }
        }
      })();
    }, [currentPath, compactMode, treeViewRef]);

    const TreeViewItemContent = (e: TreeViewItemModel) => {
        return (
            <>
                { e.iconRender ? <i className="dx-icon">{ e.iconRender({}) }</i> : null }
                <span>{ e.text }</span>
            </>
        );
    }

    return (
        <div className={ 'dx-swatch-additional side-navigation-menu' } ref={ getWrapperRef }>
            { children }
            <div className={ 'menu-container' }>
                <TreeView
                    ref={ treeViewRef }
                    items={ items as TreeViewItemModel[] }
                    keyExpr={ 'path' }
                    selectionMode={ 'single' }
                    itemRender={ TreeViewItemContent }
                    focusStateEnabled={ true }
                    expandEvent={ 'click' }
                    onItemClick={ event => {
                      if (event.itemData) {
                        const treeViewItem =  event.itemData as TreeViewItemModel;
                        if (treeViewItem.command === 'workDate') {
                          showWorkDatePicker();
                        }
                        if (treeViewItem.command === 'exit') {
                          signOutWithConfirm();
                        }
                        selectedItemChanged(event);
                      }
                    } }
                    onContentReady={ () => {
                      onMenuReady();
                    } }
                    width={ '100%' }
                />
            </div>
        </div>
    );
}
