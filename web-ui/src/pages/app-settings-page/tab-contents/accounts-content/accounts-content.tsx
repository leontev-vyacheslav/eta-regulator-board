import { useEffect, useRef, useState } from 'react';
import { DataGrid, Column, Selection, Editing, Form, Popup } from 'devextreme-react/data-grid';
import AppConstants from '../../../../constants/app-constants';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { ExtendedAccountModel } from '../../../../models/regulator-settings/accounts-model';
import { UserRoles } from '../../../../models/enums/user-role-model';
import { SimpleItem } from 'devextreme-react/form';
import { showAccessTokenPromptDialog } from '../../../../utils/dialogs';
import { FocusInEvent } from 'devextreme/ui/text_box';

export const AccountsGrid = () => {
    const dataGridRef = useRef<DataGrid<ExtendedAccountModel>>(null);
    const [accounts, setAccounts] = useState<ExtendedAccountModel[]>([]);
    const { getAccountsAsync, putAccountAsync, getAuthCheckDataAsync } = useAppData();

    useEffect(() => {
        (async () => {
            const accounts = await getAccountsAsync();
            if (accounts) {
                setAccounts(accounts.items.map(i => {
                    return {
                        ...i,
                        confirmedPassword: ''
                    } as ExtendedAccountModel;
                }));
            }
        })();
    }, [getAccountsAsync]);

    return (
        <DataGrid
            keyExpr={ 'id' }
            ref={ dataGridRef }
            className='app-grid'
            showColumnLines
            dataSource={ accounts }

            height={ AppConstants.formHeight }
            onRowUpdated={ (e) => {
                if (e.data.password === e.data.confirmedPassword) {
                    showAccessTokenPromptDialog({
                        callback: async ({ text: accessToken, modalResult }: { modalResult: string, text: string }) => {
                            if (modalResult === 'OK' && accessToken) {
                                await putAccountAsync(e.data, accessToken);

                                e.data.password = '';
                                e.data.confirmedPassword = '';
                                await getAuthCheckDataAsync();
                            }
                        }
                    })
                }
            } }
        >
            <Selection mode='single' />

            <Editing mode='popup' allowUpdating >
                <Form>
                    <SimpleItem
                        dataField='password'
                        editorType='dxTextBox'
                        editorOptions={ {
                            elementAttr: { 'id': 'account-password' },
                            onFocusIn: (e: FocusInEvent) => {
                                e.element.querySelector('input')?.removeAttribute('readonly');
                            }
                        } }></SimpleItem>
                    <SimpleItem
                        dataField='confirmedPassword'
                        editorType='dxTextBox'
                        editorOptions={ {
                            elementAttr: { 'id': 'account-confirmed-password' },
                            onFocusIn: (e: FocusInEvent) => {
                                e.element.querySelector('input')?.removeAttribute('readonly');
                            }
                        } }>

                    </SimpleItem>
                </Form>
                <Popup
                    title='Изменить пароль'
                    height={ 'auto' }
                    showTitle
                    fullScreen={ false }
                    showCloseButton
                    onShowing={ (e) => {

                        const form = document.querySelector('.dx-datagrid-edit-popup-form');

                        form?.insertAdjacentHTML(
                            'afterbegin',
                            `<input style="display:none" type="text" name="fakeusername">
                            <input style="display:none" type="password" name="fakepassword">`
                        );

                        const input1 = document.querySelector('#account-password input');
                        const input2 = document.querySelector('#account-confirmed-password input');

                        if (input1) {
                            input1.setAttribute('autocomplete', 'new-password');
                            input1.setAttribute('readonly', 'true');
                        }

                        if (input2) {
                            input2.setAttribute('autocomplete', 'new-password');
                            input2.setAttribute('readonly', 'true');
                        }
                    } } />
            </Editing>

            <Column
                dataField='role'
                lookup={ {
                    dataSource: UserRoles,
                    valueExpr: 'id',
                    displayExpr: 'description',
                } }
                allowEditing={ false }
                caption='Роль'
            />
            <Column
                dataField='login'
                caption='Логин'
                allowEditing={ false }
                showEditorAlways={ false }
            />
            <Column
                dataField='password'
                caption='Пароль'
                visible={ true }
                editorOptions={ {
                    mode: 'password',
                } }
                cellRender={ () => {
                    return <div style={ { display: 'flex', alignItems: 'center', gap: 5 } }>
                        <div className='dx-icon dx-icon-key' style={ { color: 'rgba(0, 0, 0, 0.3)', fontSize: 18 } }></div>
                        <span style={ { fontSize: 8 } }>●●●●●●</span>
                    </div>
                }
            }
            />
            <Column
                dataField='confirmedPassword'
                visible={ false }
                caption='Подтверждение пароля'
                editorOptions={ {
                    mode: 'password',
                } }
            />
        </DataGrid>
    );
}