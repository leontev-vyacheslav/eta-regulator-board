import Form, { GroupItem, SimpleItem } from 'devextreme-react/form';
import { useScreenSize } from '../../utils/media-query';
import { useRef } from 'react';

export const ServiceForm = () => {
    const dxServiceFormRef = useRef<Form>(null);
    const { isXSmall, isSmall } = useScreenSize();

    return (
        <Form
            className='app-form setting-form'
            height={ '50vh' }
            width={ isXSmall || isSmall ? '100%' : 500 }
            scrollingEnabled={ true }
            colCount={ 1 }
            formData={ {} }
            ref={ dxServiceFormRef }
        >
            <GroupItem caption='Даты и время'>
                <SimpleItem
                    dataField={ 'workDate' }
                    label={ { location: 'top', showColon: true, text: 'Рабочая дата (по часам реального времени)' } }
                    editorType={ 'dxDateBox' }
                    editorOptions={ {
                        type: 'datetime',
                        pickerType: 'rollers'
                    } } />
            </GroupItem>

        </Form>
    );
}