import Form, { Label, SimpleItem } from 'devextreme-react/form';
import AppModalPopup from '../../components/dialogs/app-modal-popup/app-modal-popup';
import { useEffect, useRef, useState } from 'react';
import { AppModalPopupProps } from '../../models/app-modal-popup-props';
import { useAppData } from '../../contexts/app-data/app-data';
import { ValueChangedEvent } from 'devextreme/ui/calendar';
import { Button } from 'devextreme-react';

export const ArchivesDateSelectorDialog = ( { callback }: AppModalPopupProps ) => {
    const formData = useRef({ archivesDate: new Date() });
    const formRef = useRef<Form>(null);
    const { getArchivesListAsync } = useAppData();
    const [archivesList, setArchivesList] = useState<Date[]>([]);
    const buttonRef = useRef<Button>(null);

    useEffect(() => {
        (async () => {
            const archivesList = await getArchivesListAsync();
            if(archivesList) {
                setArchivesList(archivesList.items);
            }
        })();
    }, [getArchivesListAsync]);

    return (
        <AppModalPopup title='Выбор даты' callback={ () => {
            callback( { modalResult: 'CANCEL' });
        } } height={ undefined } width={ undefined } >
            <Form ref={ formRef } formData={ formData }>
                <SimpleItem
                    editorType='dxCalendar'
                    dataField='archivesDate'
                    editorOptions={ {
                        onValueChanged: (e: ValueChangedEvent) => {
                            const isArchivesExisted = archivesList.some(d => d.getTime() === (e.value as Date).getTime());
                            buttonRef.current?.instance.option('disabled', !isArchivesExisted);
                        }
                    } }
               >
                <Label visible={ false } />
               </SimpleItem>
                <SimpleItem>
                    <div style={ { display: 'flex', justifyContent: 'flex-end' } }>
                        <Button ref={ buttonRef } text='Выбрать' type='default' disabled onClick={ () => {
                            const formData = formRef.current?.instance.option('formData');
                            callback( { modalResult: 'OK', data: formData.archivesDate })
                        } }/>
                    </div>
                </SimpleItem>
            </Form>
        </AppModalPopup>
    );
}