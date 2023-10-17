import { useCallback, useMemo } from 'react'
import { AddIcon, AdditionalMenuIcon } from '../../../../constants/app-icons';
import { useSchedulesContext } from './schedules-context';

export const useSchedulesMenuItems = () => {
    const { dataGridRef } = useSchedulesContext();

    const addScheduleAsync = useCallback(async () => {
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
                    onClick: addScheduleAsync
                }
            ]
        }];
    }, [addScheduleAsync])
}
