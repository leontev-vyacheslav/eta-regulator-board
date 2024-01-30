import { useCallback, useEffect, useRef, useState } from 'react';
import { DataGrid, Column, Selection, Editing, Popup, Form } from 'devextreme-react/data-grid';
import AppConstants from '../../../../constants/app-constants';
import { useAppData } from '../../../../contexts/app-data/app-data';
import { ExtendedAccountModel } from '../../../../models/regulator-settings/accounts-model';
import { UserRoles } from '../../../../models/enums/user-role-model';
import { RequiredRule, SimpleItem, StringLengthRule } from 'devextreme-react/form';
import { showAccessTokenPromptDialog } from '../../../../utils/dialogs';
import { FocusInEvent } from 'devextreme/ui/text_box';
import { PageToolbar } from '../../../../components/page-toolbar/page-toolbar';
import { proclaim } from '../../../../utils/proclaim';
import { RowUpdatedEvent } from 'devextreme/ui/data_grid';


export const AccountsGrid = () => {
    const dataGridRef = useRef<DataGrid<ExtendedAccountModel>>(null);
    const [accounts, setAccounts] = useState<ExtendedAccountModel[]>([]);
    const { getAccountsAsync, putAccountAsync, getAuthCheckDataAsync } = useAppData();

    const onShowPasswordClickHandler = useCallback((editorId: string) => {
        const inputElement = document.querySelector(`#${editorId} input`);
        const iconElement = document.querySelector(`#${editorId} .dx-icon`);
        if (inputElement) {
            const type = inputElement.getAttribute('type');
            inputElement.setAttribute('type', type === 'text' ? 'password' : 'text');
        }
        if (iconElement) {
            iconElement.classList.toggle('dx-icon-eye');
            iconElement.classList.toggle('dx-icon-eyeclose');
        }
    }, []);

    const onFocusInHandler = useCallback((e: FocusInEvent) => {
        e.element.querySelector('input')?.removeAttribute('readonly');
    }, []);

    const onPopupShowingHandler = useCallback(() => {
        const form = document.querySelector('.dx-datagrid-edit-popup-form');

        if (!form) {
            return;
        }

        const toggleInput = (input: Element | null) => {
            if (input) {
                input.setAttribute('autocomplete', 'new-password');
                input.setAttribute('readonly', 'true');
            }
        };

        form.insertAdjacentHTML(
            'afterbegin',
            `<input style="display:none" type="text" name="fakeusername">
            <input style="display:none" type="password" name="fakepassword">`
        );

        document.querySelectorAll('#account-password input, #account-confirmed-password input')
            .forEach(input => {
                toggleInput(input);
            });
    }, []);

    const onGridRowUpdated = useCallback((e: RowUpdatedEvent<ExtendedAccountModel, any>) => {
        if (e.data.password === e.data.confirmedPassword) {
            showAccessTokenPromptDialog({
                callback: async ({ text: accessToken, modalResult }: { modalResult: string, text: string }) => {
                    if (modalResult === 'OK' && accessToken) {
                        await putAccountAsync(e.data, accessToken);
                        await getAuthCheckDataAsync();
                        e.data.password = '';
                        e.data.confirmedPassword = '';
                    }
                }
            })
        } else {
            proclaim({
                type: 'error',
                message: 'Значение пароля не совпала с его подтверждением.'
            });
        }
        e.data.password = '';
        e.data.confirmedPassword = '';
    }, [getAuthCheckDataAsync, putAccountAsync]);

    const gridPasswordCellRender = useCallback(() => {
        return (
            <div style={ { display: 'flex', alignItems: 'center', gap: 5 } }>
                <div className='dx-icon dx-icon-key' style={ { color: 'rgba(0, 0, 0, 0.3)', fontSize: 18 } }></div>
                <span style={ { fontSize: 10, color: 'rgba(0, 0, 0, 0.6)' } }>●●●●●</span>
            </div>
        );
    }, []);

    useEffect(() => {
        (async () => {
            const accounts = await getAccountsAsync();
            if (accounts) {
                setAccounts(accounts.items.map(acc => {
                    return {
                        ...acc,
                        confirmedPassword: '',
                    };
                }));
            }
        })();
    }, [getAccountsAsync]);

    return (
        <div className='setting-form'>
            <PageToolbar title={ 'Список учетный записей' } menuItems={ [] } />
            <DataGrid
                ref={ dataGridRef }
                keyExpr={ 'id' }
                className='app-grid'
                showColumnLines
                dataSource={ accounts }
                height={ AppConstants.formHeight }
                onRowUpdated={ onGridRowUpdated }
            >
                <Selection mode='single' />
                <Editing mode='popup' allowUpdating>
                    <Form elementAttr={ { class: 'app-form' } } >
                        <SimpleItem
                            dataField='login'
                            editorOptions={ {
                                readonly: true
                            } }
                        />
                        <SimpleItem
                            dataField='password'
                            editorType='dxTextBox'
                            editorOptions={ {
                                elementAttr: { 'id': 'account-password' },
                                onFocusIn: onFocusInHandler,
                                mode: 'password',
                                buttons: [
                                    {
                                        name: 'show',
                                        options: {
                                            icon: 'eyeopen',
                                            stylingMode: 'text',
                                            onClick: () => onShowPasswordClickHandler('account-password')
                                        }
                                    }
                                ]
                            } }>
                            <RequiredRule />
                            <StringLengthRule min={ 8 } max={ 16 } />
                        </SimpleItem>
                        <SimpleItem
                            dataField='confirmedPassword'
                            editorType='dxTextBox'
                            editorOptions={ {
                                elementAttr: { 'id': 'account-confirmed-password' },
                                onFocusIn: onFocusInHandler,
                                mode: 'password',
                                buttons: [
                                    {
                                        name: 'show',
                                        options: {
                                            icon: 'eyeopen',
                                            stylingMode: 'text',
                                            onClick: () => onShowPasswordClickHandler('account-confirmed-password')
                                        }
                                    }
                                ]
                            } }>
                            <RequiredRule />
                            <StringLengthRule min={ 8 } max={ 16 } />
                        </SimpleItem>
                    </Form>
                    <Popup
                        elementAttr={ { class: 'app-popup' } }
                        title='Изменить пароль'
                        height={ 'auto' }
                        showTitle
                        fullScreen={ false }
                        showCloseButton
                        onShowing={ onPopupShowingHandler } />
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
                />
                <Column
                    dataField='password'
                    caption='Пароль'
                    visible={ true }
                    cellRender={ gridPasswordCellRender }
                />
                <Column
                    dataField='confirmedPassword'
                    visible={ false }
                    caption='Подтверждение пароля'

                />
            </DataGrid>
        </div>
    );
}