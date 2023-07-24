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
                    <Tab title={ 'Карта' }>
                        <SimpleItem
                            dataField={ 'isShownBreakInterval' }
                            label={ { location: 'top', showColon: true, text: 'Показывать интервалы разрыва на карте' } }
                            editorType={ 'dxCheckBox' }
                        />
                        <SimpleItem
                            dataField={ 'breakInterval' }
                            label={ { location: 'top', showColon: true, text: 'Интервал разрыва, (м)' } }
                            editorType={ 'dxNumberBox' }
                            editorOptions={ {
                                type: 'integer',
                                min: 100,
                                max: 10000
                            } }
                        />
                        <SimpleItem
                            dataField={ 'minimalAccuracy' }
                            label={ { location: 'top', showColon: true, text: 'Минимальная точность, (м)' } }
                            editorType={ 'dxNumberBox' }
                            editorOptions={ {
                                type: 'integer',
                                min: 10,
                                max: 1000,
                            } }
                        />

                    </Tab>
                    <Tab title={ 'Зоны' }>
                        <SimpleItem
                            dataField={ 'stationaryZoneRadius' }
                            label={ { location: 'top', showColon: true, text: 'Радиус окрестности, (м)' } }
                            editorType={ 'dxNumberBox' }
                            editorOptions={ {
                                type: 'integer',
                                min: 50,
                                max: 200,
                            } }
                        />
                        <SimpleItem
                            dataField={ 'stationaryZoneElementCount' }
                            label={ { location: 'top', showColon: true, text: 'Порог числа локаций' } }
                            editorType={ 'dxNumberBox' }
                            editorOptions={ {
                                type: 'integer',
                                min: 5,
                                max: 100,
                            } }
                        />
                        <SimpleItem
                            dataField={ 'stationaryZoneCriteriaSpeed' }
                            label={ { location: 'top', showColon: true, text: 'Префильтр скорости, (м/с)' } }
                            editorType={ 'dxNumberBox' }
                            editorOptions={ {
                                type: 'integer',
                                min: 1,
                                max: 3,
                            } }
                        />
                        <SimpleItem
                            dataField={ 'useStationaryZoneCriteriaAccuracy' }
                            label={ { location: 'top', showColon: true, text: 'Использовать префильтр точности' } }
                            editorType={ 'dxCheckBox' }
                        />
                        <SimpleItem
                            dataField={ 'stationaryZoneCriteriaAccuracy' }
                            label={ { location: 'top', showColon: true, text: 'Префильтр точноcти, (м)' } }
                            editorType={ 'dxNumberBox' }
                            editorOptions={ {
                                type: 'integer',
                                min: 3,
                                max: 100,
                            } }
                        />

                    </Tab>
                    <Tab title={ 'Адреса' } >
                        <SimpleItem
                            dataField={ 'useStationaryZoneAddressesOnMap' }
                            label={ { location: 'top', showColon: true, text: 'Получать адреса в зоне для карты' } }
                            editorType={ 'dxCheckBox' }
                        />
                        <SimpleItem
                            dataField={ 'useStationaryZoneAddressesOnList' }
                            label={ { location: 'top', showColon: true, text: 'Получать адреса в зоне для списка' } }
                            editorType={ 'dxCheckBox' }
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
