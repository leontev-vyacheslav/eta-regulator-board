import { useState, useRef, useCallback } from 'react';
import Form, { Item, Label, ButtonItem, ButtonOptions, RequiredRule } from 'devextreme-react/form';
import LoadIndicator from 'devextreme-react/load-indicator';
import notify from 'devextreme/ui/notify';
import { useAuth } from '../../contexts/auth';

import './login-form.scss';
import { LoginFormModel } from '../../models/login-form';

export default function () {
    const { signIn } = useAuth();
    const [loading, setLoading] = useState<boolean>(false);
    const formData = useRef<LoginFormModel>({
        email: null,
        password: null
    } as LoginFormModel);

    const onSubmit = useCallback(async (e) => {
        e.preventDefault();
        if(formData.current) {
            const { email, password } = formData.current;
            setLoading(true);
            try {
                await signIn(email!, password!);
                notify(`Пользователь ${email} успешно выполнил вход.`, 'success', 5000);
            } catch (error) {
                notify('Пользователь не найден или неверный пароль.', 'error', 5000);
            }
            setLoading(false);
        }
    }, [signIn]);

    return (
        <form className={ 'login-form' } onSubmit={ onSubmit }>
            <Form formData={ formData.current } disabled={ loading }>
                <Item dataField={ 'email' } editorType={ 'dxTextBox' } editorOptions={ emailEditorOptions }>
                    <RequiredRule message="Требуется  электронная почта"/>
                    <Label visible={ false }/>
                </Item>
                <Item dataField={ 'password' } editorType={ 'dxTextBox' } editorOptions={ passwordEditorOptions }>
                    <RequiredRule message="Требуется пароль"/>
                    <Label visible={ false }/>
                </Item>
                <Item dataField={ 'rememberMe' } editorType={ 'dxCheckBox' } editorOptions={ rememberMeEditorOptions }>
                    <Label visible={ false }/>
                </Item>
                <ButtonItem>
                    <ButtonOptions width={ '100%' } type={ 'default' } useSubmitBehavior={ true }>
                        <span className="dx-button-text">
                          {
                              loading
                                  ? <LoadIndicator width={ '24px' } height={ '24px' } visible={ true }/>
                                  : 'Вход'
                          }
                        </span>
                    </ButtonOptions>
                </ButtonItem>
            </Form>
        </form>
    );
}

const emailEditorOptions = { stylingMode: 'filled', placeholder: 'Имя пользователя', mode: 'text' };
const passwordEditorOptions = { stylingMode: 'filled', placeholder: 'Пароль', mode: 'password' };
const rememberMeEditorOptions = { text: 'Запомнить меня', elementAttr: { class: 'form-text' } };
