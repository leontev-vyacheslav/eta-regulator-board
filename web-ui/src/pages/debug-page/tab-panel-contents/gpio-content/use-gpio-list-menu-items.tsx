import { useCallback, useMemo } from 'react'
import {  AdditionalMenuIcon, RefreshIcon } from '../../../../constants/app-icons';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { useGpioTabContext } from './gpio-tab-context';

export const useGpioListMenuItems = () => {
    const { getGpioAllAsync } = useAppData();
    const { setGpioSet } = useGpioTabContext();

    const refreshGpioSetAsync = useCallback(async () => {
        const gpioSet = await getGpioAllAsync();

        if (gpioSet) {
            setGpioSet(gpioSet);
        }

    }, [getGpioAllAsync, setGpioSet]);


    return useMemo(() => {
        return [{
            icon: () => <AdditionalMenuIcon size={ 20 } color='black' />,
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