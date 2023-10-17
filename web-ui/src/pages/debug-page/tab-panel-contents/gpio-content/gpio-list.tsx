import { List } from 'devextreme-react/list';
import Switch from 'devextreme-react/switch';
import { Ref } from 'react';
import { GpioItemModel } from '../../../../models/regulator-settings/gpio-set-model';
import { useGpioData } from '../../../../contexts/app-data/use-gpio-data';
import { useGpioTabContext } from './gpio-tab-context';
import React from 'react';

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

    return (
        gpioSet ?
        <List
            className='app-list gpio-list'
            ref={ innerRef }
            dataSource={ gpioSet?.items }
            itemRender={ (gpioItem: GpioItemModel) => {
                return (
                    <GpioListItem  gpioItem={ gpioItem }/>
                )
            } }
        />
        : <div className='dx-empty-message' style={ { height: '50vh' } }>Нет данных для отображения</div>
    );
}

export const GpioList = React.forwardRef<List<GpioItemModel>, GpioListProps>((props, ref) =>
  <GpioListInner { ...props } innerRef={ ref }/>
);