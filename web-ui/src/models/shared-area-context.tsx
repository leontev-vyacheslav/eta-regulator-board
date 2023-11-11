import { ProcFunc } from './primitive-type';
import { RefObject } from 'react';
import TreeView from 'devextreme-react/tree-view';
import { TreeViewItemModel } from './tree-view-item';
import LoadPanel from 'devextreme-react/load-panel';

export type SharedAreaContextModel = {
  signOutWithConfirm: ProcFunc;

  showLoader: ProcFunc;

  hideLoader: ProcFunc;

  treeViewRef: RefObject<TreeView<TreeViewItemModel>>;

  loaderRef: RefObject<LoadPanel>;
};
