import { CSSProperties, FunctionComponent, ReactNode } from 'react';
import { IconBaseProps } from 'react-icons/lib/cjs/iconBase';

export type DataGridIconCellValueContainerProps = {
  cellDataFormatter: () => ReactNode,
  iconRenderer: FunctionComponent<IconBaseProps>,
  rowStyle?: CSSProperties
}
