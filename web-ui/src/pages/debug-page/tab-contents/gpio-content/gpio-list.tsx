import { List } from 'devextreme-react/list';
import Switch from 'devextreme-react/switch';
import { Ref } from 'react';
import { GpioItemModel } from '../../../../models/regulator-settings/gpio-set-model';
import { useGpioData } from '../../../../contexts/app-data/use-gpio-data';
import { useGpioTabContext } from './gpio-tab-context';
import React from 'react';
import { formatMessage } from 'devextreme/localization';
import { useScreenSize } from '../../../../utils/media-query';
import { PageToolbar } from '../../../../components/page-toolbar/page-toolbar';
import { useGpioListMenuItems } from './use-gpio-list-menu-items';

export type GpioListProps = { innerRef?: Ref<List<GpioItemModel>> }

const GpioListItem = ({ gpioItem }: {gpioItem: GpioItemModel}) => {
    const { putGpioAsync } = useGpioData();

    return (
        <div className='gpio-list-item' key={ gpioItem.pin }>
            <div className='gpio-list-item__pin'>GPIO{gpioItem.pin}:</div>
            <div className='gpio-list-item__description'>{gpioItem.description}</div>
            <div className='gpio-list-item__switch' >
                <Switch defaultValue={ gpioItem.state } onValueChanged={ async (e) => {
                    const gpio = await putGpioAsync(gpioItem.pin, e.value);
                    if (gpio && gpio.pin === gpioItem.pin && gpio.state === e.value) {
                        gpioItem.state = e.value;
                    }
                } } />
            </div>
        </div>
    );
};

export const GpioListInner = ({ innerRef }: GpioListProps) => {
    const { gpioSet } = useGpioTabContext();
    const { isXSmall, isSmall } = useScreenSize();
    const listMenuItems = useGpioListMenuItems();

    return (
        gpioSet ?
        <>
            <PageToolbar title={ 'Элементы ввода/вывода' } menuItems={ listMenuItems } style={ { width: isXSmall || isSmall ? '100%' : 600  } } />
            <List
                height={ '50vh' }
                width={ isXSmall || isSmall ? '100%' : 600 }
                className='app-list gpio-list'
                ref={ innerRef }
                dataSource={ gpioSet?.items }
                itemRender={ (gpioItem: GpioItemModel) => {
                    return (
                        <GpioListItem  gpioItem={ gpioItem }/>
                    )
                } }
            />
        </>
        : <div className='dx-empty-message' style={ { height: '50vh', /*width: isXSmall || isSmall ? '100%' : 600*/ } }>{formatMessage('dxCollectionWidget-noDataText')}</div>
    );
}

export const GpioList = React.forwardRef<List<GpioItemModel>, GpioListProps>((props, ref) =>
  <GpioListInner { ...props } innerRef={ ref }/>
);