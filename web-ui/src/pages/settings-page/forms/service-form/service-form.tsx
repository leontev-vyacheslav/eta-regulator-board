import Form, { GroupItem, SimpleItem } from 'devextreme-react/form';
import { useScreenSize } from '../../../../utils/media-query';
import { useRef } from 'react';
import { useSettingPageContext } from '../../settings-page-context';

export const ServiceForm = () => {
    const dxInfoFormRef = useRef<Form>(null);
    const { isXSmall, isSmall } = useScreenSize();
    const { regulatorSettings } = useSettingPageContext();

    return (
        <Form
            className={ 'app-form setting-form' }
            height={ '50vh' }
            width={ isXSmall || isSmall ? '100%' : 600 }
            scrollingEnabled={ true }
            colCount={ 1 }
            formData={ regulatorSettings?.service }
            ref={ dxInfoFormRef }
        >
            <GroupItem caption='Даты и время'>
                <SimpleItem
                    dataField={ 'rtcDatetime.datetime' }
                    label={ { location: 'top', showColon: true, text: 'Рабочая дата (по часам реального времени)' } }
                    editorType={ 'dxDateBox' }
                    editorOptions={ {
                        type: 'datetime',
                        pickerType: 'rollers'
                    } } />
            </GroupItem>
            <GroupItem caption={ 'Собственник' }>
                <SimpleItem
                    dataField={ 'regulatorOwner.name' }
                    label={ { location: 'top', showColon: true, text: 'Собственник' } }
                    editorType={ 'dxTextBox' }
                    editorOptions={ {

                    } } />
                <SimpleItem
                    dataField={ 'regulatorOwner.phoneNumber' }
                    label={ { location: 'top', showColon: true, text: 'Телефон' } }
                    editorType={ 'dxTextBox' }
                    editorOptions={ {
                        mask: '+7 (000) 000-00-00'
                    } } />
            </GroupItem>
            <GroupItem caption='Версии ПО'>
                <SimpleItem
                 dataField={ 'softwareInfo.webApiVersion' }
                    label={ { location: 'top', showColon: true, text: 'Версия веб-api' } }
                    editorType={ 'dxTextBox' }
                    editorOptions={ {
                        readOnly: true
                    } } />
                <SimpleItem
                    dataField={ 'softwareInfo.webUiVersion' }
                    label={ { location: 'top', showColon: true, text: 'Версия приложения' } }
                    editorType={ 'dxTextBox' }
                    editorOptions={ {
                        readOnly: true
                    } } />
            </GroupItem>
        </Form>
    );
}