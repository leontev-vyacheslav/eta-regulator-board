import React, { useRef } from 'react';
import Form, { GroupItem, SimpleItem, Tab, TabbedItem } from 'devextreme-react/form';
import ScrollView from 'devextreme-react/scroll-view';
import Button from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';
import { useAppSettings } from '../../contexts/app-settings';
import { useScreenSize } from '../../utils/media-query';
import './settings-form.scss';
import { SettingsFormProps } from '../../models/settings-form-props';

const SettingsForm = ({ style }: SettingsFormProps) => {
    const dxAppSettingsFormRef = useRef<Form>(null);
    const { appSettingsData, setAppSettingsData } = useAppSettings();
    const { isXSmall } = useScreenSize();

    return (
        <ScrollView height={ '100%' } width={ '100%' }>
            <Form
                height={ 600 }
                width={ style.width }
                scrollingEnabled={ true }
                colCount={ 1 }
                formData={ appSettingsData }
                ref={ dxAppSettingsFormRef }
            >
                <TabbedItem >
                    <Tab title={ 'Основные' }>
                        <SimpleItem
                            dataField={ 'workDate' }
                            label={ { location: 'top', showColon: true, text: 'Рабочая дата' } }
                            editorType={ 'dxDateBox' }
                            editorOptions={ {
                                type: 'date'
                            } }
                        />
                    </Tab>
                </TabbedItem>
                <GroupItem>
                    <Button className={ 'form-button' } text={ 'Сохранить' } width={ 125 } type={ 'default' }
                            onClick={ () => {
                                const formRef = dxAppSettingsFormRef.current;
                                if (formRef && formRef.instance) {
                                    setAppSettingsData({ ...appSettingsData, ...formRef.instance.option('formData') });
                                    notify({
                                            message: 'Настройки приложения успешно сохранены.',
                                            width: 300,
                                            height: 60,
                                            position: isXSmall ? 'bottom center' : {
                                                at: 'bottom right',
                                                my: 'bottom right',
                                                offset: '-20 -20'
                                            }
                                        }, 'success', 5000
                                    );
                                }
                            } }/>
                </GroupItem>
            </Form>
        </ScrollView>
    );
}

export default SettingsForm;
