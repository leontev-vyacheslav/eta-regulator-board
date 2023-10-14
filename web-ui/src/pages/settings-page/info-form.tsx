import Form, { GroupItem, SimpleItem } from 'devextreme-react/form';
import { useScreenSize } from '../../utils/media-query';
import { useRef } from 'react';

export const InfoForm = () => {
    const dxInfoFormRef = useRef<Form>(null);
    const { isXSmall, isSmall } = useScreenSize();

    return (
        <Form
            className={ 'app-form setting-form' }
            height={ '50vh' }
            width={ isXSmall || isSmall ? '100%' : 600 }
            scrollingEnabled={ true }
            colCount={ 1 }
            formData={ null }
            ref={ dxInfoFormRef }
        >
            <GroupItem caption={ 'Собственник' }>
                <SimpleItem
                    label={ { location: 'top', showColon: true, text: 'Собственник' } }
                    editorType={ 'dxTextBox' }
                    editorOptions={ {
                        value: 'ETA24'
                    } } />
                <SimpleItem
                    label={ { location: 'top', showColon: true, text: 'Телефон' } }
                    editorType={ 'dxTextBox' }
                    editorOptions={ {
                        value: '9274484221',
                        mask: '+7 (000) 000-00-00'
                    } } />
            </GroupItem>
            <GroupItem caption='Версии ПО'>
                <SimpleItem
                    label={ { location: 'top', showColon: true, text: 'Версия веб-api' } }
                    editorType={ 'dxTextBox' }
                    editorOptions={ {
                        readOnly: true,
                        value: 'v.0.1.20231004-064321'
                    } } />
                <SimpleItem
                    label={ { location: 'top', showColon: true, text: 'Версия приложения' } }
                    editorType={ 'dxTextBox' }
                    editorOptions={ {
                        readOnly: true,
                        value: 'v.0.1.20231004-064113'
                    } } />
            </GroupItem>
        </Form>
    );
}