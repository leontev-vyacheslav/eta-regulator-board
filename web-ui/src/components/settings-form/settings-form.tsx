import { useRef } from 'react';
import Form, { GroupItem, SimpleItem } from 'devextreme-react/form';
import TabPanel, { Item } from 'devextreme-react/tab-panel';

import Button from 'devextreme-react/button';
import { useAppSettings } from '../../contexts/app-settings';
import { useScreenSize } from '../../utils/media-query';
import './settings-form.scss';
import { SettingsFormProps } from '../../models/settings-form-props';
import { useAppData } from '../../contexts/app-data/app-data';
import { proclaim } from '../../utils/proclaim';
import { DataGrid, Selection, Column, Editing } from 'devextreme-react/data-grid';

const SettingsForm = ({ style }: SettingsFormProps) => {
    const dxAppSettingsFormRef = useRef<Form>(null);
    const { appSettingsData, setAppSettingsData } = useAppSettings();
    const { putRtcDateTimeAsync } = useAppData();
    const { isXSmall, isSmall } = useScreenSize();
    const ds = {
        items: [
            {
                outdoorTemperature: -30.0,
                supplyPipeTemperature: 90.0,
                returnPipeTemperature: 60.0
            },
            {
                outdoorTemperature: 10.0,
                supplyPipeTemperature: 33.5,
                returnPipeTemperature: 29.6
            }
        ]
    }
    return (
        <>
            <TabPanel width={ '100%' } loop>

                <Item title={ 'Информация' } >
                    <Form
                        className='app-form setting-form'
                        height={ '50vh' }
                        width={ isXSmall || isSmall ? '100%' : style.width }
                        scrollingEnabled={ true }
                        colCount={ 1 }
                        formData={ appSettingsData }
                        ref={ dxAppSettingsFormRef }
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
                        <GroupItem>
                            <Button className={ 'form-button' } text={ 'Сохранить' } width={ 125 } type={ 'default' }
                                onClick={ async () => {
                                    const formRef = dxAppSettingsFormRef.current;
                                    if (formRef && formRef.instance) {
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        const formData = formRef.instance.option('formData');
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
                                } } /></GroupItem>
                    </Form>
                </Item>
                <Item title={ 'Управление' }>
                    <Form
                        className='app-form setting-form'
                        height={ '50vh' }
                        width={ isXSmall || isSmall ? '100%' : style.width }
                        scrollingEnabled={ true }
                        colCount={ 1 }
                        formData={ appSettingsData }
                        ref={ dxAppSettingsFormRef }
                    >
                        <GroupItem caption={ 'Режимы' }>
                            <SimpleItem
                                dataField='controlMode'
                                label={ { location: 'top', showColon: true, text: 'Режим управления' } }
                                editorType={ 'dxSelectBox' }
                                editorOptions={ { items: [1, 2] } } />

                            <SimpleItem
                                dataField='manualControlMode'
                                label={ { location: 'top', showColon: true, text: 'Режим ручного управления' } }
                                editorType={ 'dxSelectBox' }
                                editorOptions={ { items: [1, 2] } } />

                            <SimpleItem
                                dataField=''
                                label={ { location: 'top', showColon: true, text: 'Действие клапана' } }
                                editorType={ 'dxSelectBox' }
                                editorOptions={ { items: [1, 2] } } />
                        </GroupItem>

                        <GroupItem caption={ 'Уставки' }>
                            <SimpleItem
                                dataField='manualControlModeTemperatureSetpoint'
                                label={ { location: 'top', showColon: true, text: 'Уставка темп. ручного режима' } }
                                editorType={ 'dxNumberBox' }
                                editorOptions={ { showSpinButtons: true, min: 30, max: 100, value: 60 } } />

                            <SimpleItem
                                dataField='analogValveSetpoint'
                                label={ { location: 'top', showColon: true, text: 'Уставка темп. ручного режима' } }
                                editorType={ 'dxNumberBox' }
                                editorOptions={ { showSpinButtons: true, min: 0, max: 100, value: 50 } } />
                        </GroupItem>
                        <GroupItem caption={ 'Температуры' }>
                            <SimpleItem
                                dataField='comfortTemperature'
                                label={ { location: 'top', showColon: true, text: 'Температура комфортная' } }
                                editorType={ 'dxNumberBox' }
                                editorOptions={ { showSpinButtons: true, min: 15, max: 30, value: 23 } } />

                            <SimpleItem
                                dataField='economicalTemperature'
                                label={ { location: 'top', showColon: true, text: 'Температура экономная' } }
                                editorType={ 'dxNumberBox' }
                                editorOptions={ { showSpinButtons: true, min: 15, max: 30, value: 18 } } />

                            <SimpleItem
                                dataField='roomTemperartureInfluence'
                                label={ { location: 'top', showColon: true, text: 'Влияние темп. помещения' } }
                                editorType={ 'dxNumberBox' }
                                editorOptions={ { showSpinButtons: true, min: 1, max: 5, value: 2 } } />

                            <SimpleItem
                                dataField='returnPipeTemperatureInfluience'
                                label={ { location: 'top', showColon: true, text: 'Влияние темп. обратки' } }
                                editorType={ 'dxNumberBox' }
                                editorOptions={ { showSpinButtons: true, min: 1, max: 5, value: 1 } } />


                            <SimpleItem
                                dataField='supplyPipeMinTemperature'
                                label={ { location: 'top', showColon: true, text: 'Минимальная температура подачи' } }
                                editorType={ 'dxNumberBox' }
                                editorOptions={ { showSpinButtons: true, min: 30, max: 50, value: 30 } } />

                            <SimpleItem
                                dataField='supplyPipeMaxTemperature'
                                label={ { location: 'top', showColon: true, text: 'Максимальная температура подачи' } }
                                editorType={ 'dxNumberBox' }
                                editorOptions={ { showSpinButtons: true, min: 50, max: 100, value: 90 } } />
                        </GroupItem>
                        <GroupItem caption={ 'Насосы' }>
                            <SimpleItem
                                dataField='startingCirculationPump'
                                label={ { location: 'top', showColon: true, text: 'Стартовый циркуляционный насос' } }
                                editorType={ 'dxSelectBox' }
                                editorOptions={ { items: [1, 2] } } />

                            <SimpleItem
                                dataField='startingRechargePump'
                                label={ { location: 'top', showColon: true, text: 'Стартовый подпиточный насос' } }
                                editorType={ 'dxSelectBox' }
                                editorOptions={ { items: [1, 2] } } />
                        </GroupItem>
                        <GroupItem>
                            <Button className={ 'form-button' } text={ 'Сохранить' } width={ 125 } type={ 'default' }
                                onClick={ async () => {
                                    const formRef = dxAppSettingsFormRef.current;
                                    if (formRef && formRef.instance) {
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        const formData = formRef.instance.option('formData');
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
                                } } /></GroupItem>
                    </Form>
                </Item>
                <Item title='Сервис'>
                    <Form
                        className='app-form setting-form'
                        height={ '50vh' }
                        width={ isXSmall || isSmall ? '100%' : 500 }
                        scrollingEnabled={ true }
                        colCount={ 1 }
                        formData={ {} }
                        ref={ dxAppSettingsFormRef }
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
                        <GroupItem>
                            <Button className={ 'form-button' } text={ 'Сохранить' } width={ 125 } type={ 'default' }
                                onClick={ async () => {
                                    const formRef = dxAppSettingsFormRef.current;
                                    if (formRef && formRef.instance) {
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        const formData = formRef.instance.option('formData');
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
                                } } /></GroupItem>
                    </Form>
                </Item>
                <Item title={ 'Темп. графики' }>
                    <DataGrid dataSource={ ds.items } height={ '50vh' } className='setting-grid'>

                        <Selection mode='single' />
                        <Column dataField='outdoorTemperature' caption='Внеш. (°C)' allowSorting={ false } />
                        <Column dataField='supplyPipeTemperature' caption='Подача (°C)' allowSorting={ false } />
                        <Column dataField='returnPipeTemperature' caption='Обратка (°C)' allowSorting={ false } />

                        <Editing
                            mode='row'
                            allowUpdating={ true }
                        />
                        {/* <Toolbar >
                            <Ti name="columnChooserButton" showText="always" />
                            <Ti showText="always">

                            </Ti>
                        </Toolbar> */}
                    </DataGrid>
                </Item>
                <Item title={ 'Состояние' } >
                    <Form
                        className='app-form setting-form'
                        height={ '50vh' }
                        width={ isXSmall || isSmall ? '100%' : style.width }
                        scrollingEnabled={ true }
                        colCount={ 1 }
                        formData={ appSettingsData }
                        ref={ dxAppSettingsFormRef }
                    >
                        <GroupItem caption={ 'Состояние' }>
                            <SimpleItem

                                label={ { location: 'top', showColon: true, text: 'Состояние регулятора (вкл/выкл)' } }
                                editorType={ 'dxSwitch' }
                                editorOptions={ {} } />
                        </GroupItem>

                    </Form>
                </Item>
            </TabPanel>


        </>
    );
}

export default SettingsForm;
