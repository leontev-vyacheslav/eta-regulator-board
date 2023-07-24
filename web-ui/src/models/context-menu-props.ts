import { Ref } from 'react';
import ContextMenu from 'devextreme-react/context-menu';
import { ContextMenuItemItemModel } from './context-menu-item-props';

export type ContextMenuProps = {
  innerRef?: Ref<ContextMenu<ContextMenuItemItemModel>>,
  commands: any
}
