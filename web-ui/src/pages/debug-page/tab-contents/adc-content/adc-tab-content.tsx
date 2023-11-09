import { useCallback, useMemo, useRef } from 'react';
import 'devextreme-react/text-area';
import { Form, GroupItem, SimpleItem, ButtonItem } from 'devextreme-react/form';
import { useScreenSize } from '../../../../utils/media-query';
import './adc-tab-content.scss'
import TextArea from 'devextreme-react/text-area';

import { useAppData } from '../../../../contexts/app-data/app-data';

type AdcFormData = {
    channel: number;
    isReadContinually: boolean;
    readContinuallyInterval: number;
    timeoutObject: ReturnType<typeof setInterval> | null;
    fromTemperarureSensor: boolean;
}

enum AdcReadMode {
    Adc,
    Temp
}

export const AdcTabContent = () => {
    const { isXSmall, isSmall } = useScreenSize();
    const { getAdcValueAsync, getTemperatureValueAsync } = useAppData();
    const textAreaRef = useRef<TextArea>(null);

    const formData = useMemo<AdcFormData>(() => {
        return {
            channel: 0,
            isReadContinually: false,
            readContinuallyInterval: 1,
            timeoutObject: null,
            fromTemperarureSensor: false,
        } as  AdcFormData
    }, []);

    const channelList = useMemo(() => {
        return [
            { id: '453b87fb-8f2d-461f-bee9-239e2c7fbf17', pin: 0, description: 'Канал 0' },
            { id: '4ea8f075-1fc1-4b4a-a68f-30a47b9615d6', pin: 1, description: 'Канал 1' },
            { id: '6f9486da-2add-4157-a083-d46604d48e47', pin: 2, description: 'Канал 2' },
            { id: 'b25a5b95-cc68-4b35-ad9e-aa7fe6c9d2e7', pin: 3, description: 'Канал 3' },
            { id: 'c70c5d5b-adb2-47bb-8249-12ad89c42a95', pin: 4, description: 'Канал 4' },
            { id: 'a90a9023-004f-495b-97cd-c1a36e74dcf9', pin: 5, description: 'Канал 5' },
        ]
    }, []);

    const pushMessageToConsole = useCallback((message: string) => {
        if (!textAreaRef || !textAreaRef.current) {
            return;
        }

        let curentText = textAreaRef.current?.instance.option('value');
        curentText = `${curentText}${(curentText ? '\n' : '')}${message}`
        textAreaRef.current?.instance.option('value', curentText);

        const mainElement = textAreaRef.current.instance.element();
        const textAreaElement = mainElement.querySelector('textarea');
        if (textAreaElement) {
            textAreaElement.scrollTop = textAreaElement.scrollHeight;
        }
    }, []);

    const showValueAsync = useCallback(async (mode: AdcReadMode) => {
        const value = mode === AdcReadMode.Adc
            ? await getAdcValueAsync(formData.channel)
            : await getTemperatureValueAsync(formData.channel);

        if (value) {
            pushMessageToConsole(`Канал ${value?.channel}: ${value?.value.toFixed(3)}${ mode === AdcReadMode.Adc ? 'V' : '°C'}`);
        }
    }, [formData.channel, getAdcValueAsync, getTemperatureValueAsync, pushMessageToConsole]);

    return (

        <Form
            formData={ formData }
            className='app-form adc-form'
            style={ { height: '50vh' } }
            height={ '50vh' }
            width={ isXSmall || isSmall ? '100%' : 600 }
            scrollingEnabled={ true }
            colCount={ 1 }
        >
            <GroupItem caption={ 'Каналы' }>
                <SimpleItem
                    dataField='channel'
                    editorType='dxSelectBox'
                    label={ { location: 'top', showColon: true, text: 'Номер канала' } }
                    editorOptions={ {
                        displayExpr: 'description',
                        valueExpr: 'pin',
                        items: channelList
                    } }
                />

                <SimpleItem
                    dataField='isReadContinually'
                    editorType='dxSwitch'
                    label={ { location: 'top', showColon: true, text: 'Считывать непрерывно' } }
                    editorOptions={ {
                        displayExpr: 'description',
                        valueExpr: 'pin',
                        items: channelList
                    } }
                />

                <SimpleItem
                    dataField='readContinuallyInterval'
                    editorType='dxNumberBox'
                    label={ { location: 'top', showColon: true, text: 'Интервал непрерываного чтения' } }
                    editorOptions={ {
                        min: 1,
                        max: 10,
                        step: 1,
                        showSpinButtons: true,
                    } }
                />

                <SimpleItem
                    dataField='fromTemperarureSensor'
                    editorType='dxSwitch'
                    label={ { location: 'top', showColon: true, text: 'С температурного датчика' } }
                    editorOptions={ {
                        displayExpr: 'description',
                        valueExpr: 'pin',
                        items: channelList
                    } }
                />

                <SimpleItem
                    label={ { location: 'top', showColon: true, text: 'Консоль вывода' } }
                >
                    <TextArea ref={ textAreaRef } height={ 90 } spellcheck={ false } readOnly />
                </SimpleItem>
                <ButtonItem buttonOptions={ {
                    text: 'Старт', onClick: async (e) => {

                        if (formData.fromTemperarureSensor) {
                            await showValueAsync(AdcReadMode.Temp);

                            return;
                        }

                        if(formData.timeoutObject) {
                            clearInterval(formData.timeoutObject);
                            formData.timeoutObject = null;
                            e.component.option('text', 'Старт');

                            return;
                        }

                        if (formData.isReadContinually) {
                            e.component.option('text', 'Стоп');

                            const timeoutObject = setInterval(async() => {
                                await showValueAsync(AdcReadMode.Adc);
                            }, 1000 * formData.readContinuallyInterval);

                            formData.timeoutObject = timeoutObject;
                        } else {
                            await showValueAsync(AdcReadMode.Adc);
                        }
                    }
                } }></ButtonItem>
            </GroupItem>
        </Form>

    );
}