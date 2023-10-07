import { useState, useRef, useCallback, FormEvent } from 'react';
import Form, { Item, Label, ButtonItem, ButtonOptions, RequiredRule } from 'devextreme-react/form';
import LoadIndicator from 'devextreme-react/load-indicator';
import notify from 'devextreme/ui/notify';
import { useAuth } from '../../contexts/auth';

import './signin-form.scss';
import { SigninFormModel } from '../../models/signin-form-model';

export const SinginForm = () => {
    const { signIn } = useAuth();
    const [loading, setLoading] = useState<boolean>(false);
    const formData = useRef<SigninFormModel>({
        password: null,
    } as SigninFormModel);

    const onSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if(formData.current) {
            const { password } = formData.current;
            setLoading(true);
            try {
                await signIn(password!);
                notify('Пользователь успешно выполнил вход.', 'success', 5000);
            } catch (error) {
                notify('Пользователь не найден или неверный пароль.', 'error', 5000);
            }
            setLoading(false);
        }
    }, [signIn]);

    return (
        <form className={ 'signin-form' } onSubmit={ onSubmit }>
            <Form formData={ formData.current } disabled={ loading }>

                <Item dataField={ 'password' } editorType={ 'dxTextBox' } editorOptions={ { stylingMode: 'filled', placeholder: 'Пароль', mode: 'password' } }>
                    <RequiredRule message="Требуется пароль"/>
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
