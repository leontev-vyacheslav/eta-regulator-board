import { useCallback, useMemo } from 'react'
import { AddIcon, AdditionalMenuIcon } from '../../../../constants/app-icons';
import { useTemperatureGraphContext } from './temperature-graph-context';

export const useTemperatureGraphMenuItems = () => {
    const { dataGridRef } = useTemperatureGraphContext();

    const addTemperatureGraphItemAsync = useCallback(async () => {
        if(dataGridRef && dataGridRef.current) {
            await dataGridRef.current?.instance.addRow();
        }
    }, [dataGridRef]);


    return useMemo(() => {
        return [{
            icon: () => <AdditionalMenuIcon size={ 20 } color='black' />,
            items: [
                {
                    text: 'Добавить...',
                    icon: () => <AddIcon size={ 20 } />,
                    onClick: addTemperatureGraphItemAsync
                }
            ]
        }];
    }, [addTemperatureGraphItemAsync])
}
