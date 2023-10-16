import { useCallback, useMemo } from 'react'
import { AddIcon, ExtensionIcon, RefreshIcon } from '../../../../constants/app-icons';
import { useTemperatureGraphContext } from './temperature-graph-context';

export const useTemperatureGraphMenuItems = () => {
    const { dataGridRef } = useTemperatureGraphContext();
    

    const refreshTestListAsync = useCallback(async () => {

    }, []);

    const addTemperatureGraphItemAsync = useCallback(async () => {
        if(dataGridRef && dataGridRef.current) {
            await dataGridRef.current?.instance.addRow();
        }
    }, [dataGridRef]);


    return useMemo(() => {
        return [{
            icon: () => <ExtensionIcon size={ 20 } color='black' />,
            items: [
                {
                    text: 'Обновить список...',
                    icon: () => <RefreshIcon size={ 20 } />,
                    onClick: refreshTestListAsync
                },
                {
                    text: 'Добавить...',
                    icon: () => <AddIcon size={ 20 } />,
                    onClick: addTemperatureGraphItemAsync
                }
            ]
        }];
    }, [addTemperatureGraphItemAsync, refreshTestListAsync])
}
