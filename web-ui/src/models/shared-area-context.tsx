import { ProcFunc } from './primitive-type';
import { MutableRefObject, RefObject } from 'react';
import TreeView from 'devextreme-react/tree-view';
import { TreeViewItemModel } from './tree-view-item';
import { DisposedTimersDispatcher } from '../contexts/disposed-timers-dispatcher';

export type SharedAreaContextModel = {
  signOutWithConfirm: ProcFunc;
  treeViewRef: RefObject<TreeView<TreeViewItemModel>>;
  showLoader: ProcFunc;
  hideLoader: ProcFunc;
  disposedTimerDispatcher: MutableRefObject<DisposedTimersDispatcher>;
};
