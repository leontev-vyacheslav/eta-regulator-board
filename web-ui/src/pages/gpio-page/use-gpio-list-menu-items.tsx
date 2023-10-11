import { useCallback, useMemo } from 'react'
import { ExtensionIcon, RefreshIcon } from '../../constants/app-icons';
import { useAppData } from '../../contexts/app-data/app-data';
import { useGpioPageContext } from './gpio-page-context';

export const useGpioListMenuItems = () => {
    const { getGpioAllAsync } = useAppData();
    const { setGpioSet } = useGpioPageContext();

    const refreshGpioSetAsync = useCallback(async () => {
        const gpioSet = await getGpioAllAsync();

        if (gpioSet) {
            setGpioSet(gpioSet);
        }

    }, [getGpioAllAsync, setGpioSet]);


    return useMemo(() => {
        return [{
            icon: () => <ExtensionIcon size={ 20 } color='black' />,
            items: [
                {
                    text: 'Обновить список...',
                    icon: () => <RefreshIcon size={ 20 } />,
                    onClick: refreshGpioSetAsync
                }]
        }
        ]
    }, [refreshGpioSetAsync]);
}