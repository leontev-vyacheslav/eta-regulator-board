import { IconBaseProps } from 'react-icons/lib/cjs/iconBase';

export type TreeViewItemModel = {
  id: string;
  
  text: string;

  path?: string;

  iconRender: (props: IconBaseProps) => JSX.Element;

  expanded?: boolean;

  restricted: boolean;

  command?: string;

  items?: TreeViewItemModel[];
}
