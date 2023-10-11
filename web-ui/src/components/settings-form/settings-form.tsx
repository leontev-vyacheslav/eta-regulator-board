import { useRef } from 'react';
import Form, { GroupItem, SimpleItem, Tab, TabbedItem } from 'devextreme-react/form';
import ScrollView from 'devextreme-react/scroll-view';
import Button from 'devextreme-react/button';
import { useAppSettings } from '../../contexts/app-settings';
import { useScreenSize } from '../../utils/media-query';
import './settings-form.scss';
import { SettingsFormProps } from '../../models/settings-form-props';
import { useAppData } from '../../contexts/app-data/app-data';
import { proclaim } from '../../utils/proclaim';

const SettingsForm = ({ style }: SettingsFormProps) => {
    const dxAppSettingsFormRef = useRef<Form>(null);
    const { appSettingsData, setAppSettingsData } = useAppSettings();
    const { putRtcDateTimeAsync } = useAppData();
    const { isXSmall, isSmall } = useScreenSize();

    return (
        <ScrollView height={ '100%' } width={ '100%' }>
            <Form
                height={ 600 }
                width={  isXSmall || isSmall ? '100%' : style.width  }
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
                                type: 'datetime'
                            } }
                        />
                    </Tab>
                </TabbedItem>
                <GroupItem>
                    <Button className={ 'form-button' } text={ 'Сохранить' } width={ 125 } type={ 'default' }
                            onClick={ async () => {
                                const formRef = dxAppSettingsFormRef.current;
                                if (formRef && formRef.instance) {
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                    const formData =  formRef.instance.option('formData');
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars

                                     await putRtcDateTimeAsync({
                                        datetime: formData.workDate
                                    });
                                    setAppSettingsData({ ...appSettingsData, ...formRef.instance.option('formData') });
                                    proclaim({
                                        type: 'success',
                                        message: 'Настройки приложения успешно сохранены.'
                                    });
                                }
                            } }/>
                </GroupItem>
            </Form>
        </ScrollView>
    );
}

export default SettingsForm;
