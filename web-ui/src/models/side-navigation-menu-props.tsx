import { ReactNode } from 'react';
import { ItemClickEvent } from 'devextreme/ui/tree_view';
import { TreeViewItemModel } from './tree-view-item';
import { ProcFunc } from './primitive-type';

export type SideNavigationMenuProps = {
  children?: ReactNode,
  selectedItemChanged: (e: ItemClickEvent<TreeViewItemModel>) => void,
  openMenu: ProcFunc,
  compactMode: boolean,
  onMenuReady: ProcFunc
}
