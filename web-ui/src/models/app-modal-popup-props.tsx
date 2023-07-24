import { ReactNode } from 'react';
import { PopupCallbackModel } from './popup-callback';

export type AppModalPopupProps = {
  title: string,
  children: ReactNode,
  callback: ({ ...any }: PopupCallbackModel) => void
}
