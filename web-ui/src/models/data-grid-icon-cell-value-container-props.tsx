import { CSSProperties, FunctionComponent, ReactNode } from 'react';
import { IconBaseProps } from 'react-icons';

export type DataGridIconCellValueContainerProps = {
  cellDataFormatter: () => ReactNode;

  iconRenderer: FunctionComponent<IconBaseProps>;

  rowStyle?: CSSProperties;
}
