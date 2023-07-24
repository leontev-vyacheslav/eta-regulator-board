import { ProcFunc } from './primitive-type';
import { ReactNode } from 'react';

export type SimpleDialogContentModel = {
  iconName: string,
  iconSize: number,
  iconColor: string,
  textRender: () => ReactNode
}

export type SimpleDialogModel = SimpleDialogContentModel & {
  title: string,
  callback: ProcFunc | (() => Promise<void>)
}
