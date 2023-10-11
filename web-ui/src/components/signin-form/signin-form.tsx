import { useState, useRef, useCallback, FormEvent, useEffect } from 'react';
import Form, { Item, Label, ButtonItem, ButtonOptions, RequiredRule } from 'devextreme-react/form';
import LoadIndicator from 'devextreme-react/load-indicator';
import { useAuth } from '../../contexts/auth';
import { SigninFormModel } from '../../models/signin-form-model';
import { useAuthData } from '../../contexts/app-data/use-auth-data';
import { OwnerInfoModel } from '../../models/data/owner-info-model';
import { proclaim } from '../../utils/proclaim';
import './signin-form.scss';

export const SinginForm = () => {
    const [ownerInfo, setOwnerInfo] = useState<OwnerInfoModel | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const { signIn } = useAuth();
    const { getOnwnerInfoDataAsync } = useAuthData();

    useEffect(() => {
        (async () => {
            const ownerInfo = await getOnwnerInfoDataAsync();
            if (ownerInfo) {
                setOwnerInfo(ownerInfo)
            }
        })();
    }, [getOnwnerInfoDataAsync])

    const formData = useRef<SigninFormModel>(
        (
            process.env.NODE_ENV === 'production'
                ? { password: '1234567890' }
                : { password: '1234567890' }
        ) as SigninFormModel
    );

    const onSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (formData.current) {
            const { password } = formData.current;
            setLoading(true);
            try {
                await signIn(password!);
                proclaim({
                    type: 'success',
                    message: 'Пользователь успешно выполнил вход.'
                });

            } catch (error) {
                proclaim({
                    type: 'error',
                    message: 'Пользователь не найден или неверный пароль.',
                });
            }
            setLoading(false);
        }
    }, [signIn]);

    return (
        <form className={ 'signin-form' } onSubmit={ onSubmit }>
            <Form formData={ formData.current } disabled={ loading }>

                <Item dataField={ 'user' } editorType={ 'dxTextBox' } editorOptions={ { disabled: true, stylingMode: 'filled', value: ownerInfo ? ownerInfo.name : 'ETA24' } }>
                    <Label visible={ false } />
                </Item>

                <Item dataField={ 'password' } editorType={ 'dxTextBox' } editorOptions={ { stylingMode: 'filled', placeholder: 'Пароль', mode: 'password' } }>
                    <RequiredRule message="Требуется пароль" />
                    <Label visible={ false } />
                </Item>

                <ButtonItem>
                    <ButtonOptions width={ '100%' } type={ 'default' } useSubmitBehavior={ true }>
                        <span className="dx-button-text">
                            {
                                loading
                                    ? <LoadIndicator width={ '24px' } height={ '24px' } visible={ true } />
                                    : 'Вход'
                            }
                        </span>
                    </ButtonOptions>
                </ButtonItem>
            </Form>
        </form>
    );
}
