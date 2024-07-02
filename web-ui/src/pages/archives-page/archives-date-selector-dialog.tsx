import Form, { Label, SimpleItem } from 'devextreme-react/form';
import AppModalPopup from '../../components/dialogs/app-modal-popup/app-modal-popup';
import { useEffect, useRef } from 'react';
import { AppModalPopupProps } from '../../models/app-modal-popup-props';
import { useAppData } from '../../contexts/app-data/app-data';
import { ValueChangedEvent } from 'devextreme/ui/calendar';
import { Button } from 'devextreme-react';

export const ArchivesDateSelectorDialog = ( { callback }: AppModalPopupProps ) => {
    const formData = useRef({ archivesDate: new Date() });
    const formRef = useRef<Form>(null);
    const { getExistsArchivesByDateAsync } = useAppData();
    const buttonRef = useRef<Button>(null);


    useEffect(() => {
        setTimeout(() => {
            if(buttonRef && buttonRef.current) {
                buttonRef.current.instance.option('disabled', true);
            }
        }, 250);
    }, []);

    return (
        <AppModalPopup title='Выбор даты' callback={ () => {
            callback( { modalResult: 'CANCEL' });
        } } height={ 450 } width={ undefined } >
            <Form ref={ formRef } formData={ formData }>
                <SimpleItem
                    editorType='dxCalendar'
                    dataField='archivesDate'
                    editorOptions={ {
                        onValueChanged: async (e: ValueChangedEvent) => {
                            const archiveExists = await getExistsArchivesByDateAsync(0, e.value as Date);
                            if (archiveExists) {
                                const isArchivesExisted = archiveExists.exists
                                buttonRef.current?.instance.option('disabled', !isArchivesExisted);
                                buttonRef.current?.instance.option('type', 'default');
                            }
                        }
                    } }
               >
                <Label visible={ false } />
               </SimpleItem>
                <SimpleItem>
                    <div style={ { display: 'flex', justifyContent: 'flex-end' } }>
                        <Button ref={ buttonRef } text='Выбрать' onClick={ () => {
                            const formData = formRef.current?.instance.option('formData');
                            callback( { modalResult: 'OK', data: formData.archivesDate })
                        } }/>
                    </div>
                </SimpleItem>
            </Form>
        </AppModalPopup>
    );
}