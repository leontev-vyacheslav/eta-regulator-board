import { ReactNode } from 'react';
import { ItemContextMenuEvent } from 'devextreme/ui/context_menu';

export type ContextMenuItemProps = {
  item: ContextMenuItemItemModel
}

export type ContextMenuItemItemModel = {
  name?: string,
  text: string,
  renderIconItem: (item: ContextMenuItemItemModel) => ReactNode,
  renderTextItem?: (item: ContextMenuItemItemModel) => ReactNode,
  onClick: (e: ItemContextMenuEvent) => Promise<void>
}
