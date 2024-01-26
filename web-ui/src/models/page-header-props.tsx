import { ReactNode } from 'react';
import { MenuItemModel } from './menu-item-model';

export type PageHeaderProps = {
  caption: string | (() => JSX.Element);

  children: ReactNode;

  menuItems?: MenuItemModel[];
}
