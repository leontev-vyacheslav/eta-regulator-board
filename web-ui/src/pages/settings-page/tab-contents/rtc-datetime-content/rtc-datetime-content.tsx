import { useRef } from 'react';
import Form, { GroupItem, SimpleItem } from 'devextreme-react/form';
import { FieldDataChangedEvent } from 'devextreme/ui/form';
import { useScreenSize } from '../../../../utils/media-query';
import { useAppSettings } from '../../../../contexts/app-settings';
import { useAppData } from '../../../../contexts/app-data/app-data';

export const RtcDateTimeForm = () => {
    const dxRtcDateTimeFormRef = useRef<Form>(null);
    const { isXSmall, isSmall } = useScreenSize();
    const { appSettingsData } = useAppSettings();
    const { putRtcDateTimeAsync } = useAppData();

    return (
        <Form
            className={ 'app-form setting-form' }
            height={ '50vh' }
            width={ isXSmall || isSmall ? '100%' : 600 }
            scrollingEnabled={ true }
            colCount={ 1 }
            formData={ appSettingsData }
            ref={ dxRtcDateTimeFormRef }
            onFieldDataChanged={ async (e: FieldDataChangedEvent) => {
                if (e.dataField === 'workDate') {
                    await putRtcDateTimeAsync({
                        datetime: e.value as Date
                    });
                }
            } }
        >
            <GroupItem caption='Часы реального времени'>
                <SimpleItem
                    dataField={ 'workDate' }
                    label={ { location: 'top', showColon: true, text: 'Рабочая дата' } }
                    editorType={ 'dxDateBox' }
                    editorOptions={ {
                        type: 'datetime',
                        pickerType: 'rollers'
                    } } />
            </GroupItem>
        </Form>
    );
}