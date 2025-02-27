import { Ref, forwardRef } from 'react';
import { List } from 'devextreme-react/list';
import Switch from 'devextreme-react/switch';
import { GpioItemModel } from '../../../../models/regulator-settings/gpio-set-model';
import { useGpioData } from '../../../../contexts/app-data/use-gpio-data';
import { useGpioTabContext } from './gpio-tab-context';
import { formatMessage } from 'devextreme/localization';
import { PageToolbar } from '../../../../components/page-toolbar/page-toolbar';
import { useGpioListMenuItems } from './use-gpio-list-menu-items';
import AppConstants from '../../../../constants/app-constants';
import { useDebugPage } from '../../debug-page-context';

export type GpioListProps = { innerRef?: Ref<List<GpioItemModel>> }

const GpioListItem = ({ gpioItem }: {gpioItem: GpioItemModel}) => {
    const { modeId } = useDebugPage();
    const { putGpioAsync } = useGpioData();

    return (
        <div className='gpio-list-item' key={ gpioItem.pin }>
            <div className='gpio-list-item__pin'>GPIO{gpioItem.pin}:</div>
            <div className='gpio-list-item__description'>{modeId === 1 ? gpioItem.manualModeDescription: gpioItem.debugModeDescription }</div>
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
    const listMenuItems = useGpioListMenuItems();

    return (
        gpioSet ?
        <>
            <PageToolbar title={ 'Элементы ввода/вывода' } menuItems={ listMenuItems } />
            <List
                height={ AppConstants.formHeight }
                className='app-list debug-list gpio-list'
                ref={ innerRef }
                dataSource={ gpioSet?.items }
                itemRender={ (gpioItem: GpioItemModel) => {
                    return (
                        <GpioListItem  gpioItem={ gpioItem }/>
                    )
                } }
            />
        </>
        : <div className='dx-empty-message' style={ { height: '50vh', } }>{formatMessage('dxCollectionWidget-noDataText')}</div>
    );
}

export const GpioList = forwardRef<List<GpioItemModel>, GpioListProps>((props, ref) =>
  <GpioListInner { ...props } innerRef={ ref }/>
);