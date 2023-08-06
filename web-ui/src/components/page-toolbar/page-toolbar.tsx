import { MenuItemModel } from '../../models/menu-item-model';
import { MainMenu } from '../menu/main-menu/main-menu';

export const PageToolbar = ({ title,  menuItems }: { title: string, menuItems: MenuItemModel[] }) => {

  return (
    <div style={ { display: 'flex', justifyContent: 'flex-end' } }>
      <div style={ { flex: 1 } }>
        <label className='dx-field-item-label dx-field-item-label-location-top'>
          <span className='dx-field-item-label-content'>
            <span className='dx-field-item-label-text'>{title}:</span>
          </span>
        </label>
      </div>
      <MainMenu items={ menuItems } />
    </div>
  );
};