import { createContext, useCallback, useContext } from 'react';
import routes from '../constants/app-api-routes';
import { useAuth } from './auth';
import { useSharedArea } from './shared-area';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { HttpConstants } from '../constants/app-http-constants';
import notify from 'devextreme/ui/notify';
import { SharedAreaContextModel } from '../models/shared-area-context';
import { AppBaseProviderProps } from '../models/app-base-provider-props';

export type AxiosWithCredentialsFunc = (config: AxiosRequestConfig) => Promise<AxiosResponse | undefined>;
export type GetTestDataAsyncFunc = () => Promise<any>;


export type AppDataContextModel = {
  getTestDataAsync: GetTestDataAsyncFunc,
};

const AppDataContext = createContext<AppDataContextModel>({} as AppDataContextModel);
const useAppData = () => useContext(AppDataContext);

function AppDataProvider (props: AppBaseProviderProps) {

    const { getUserAuthDataFromStorage } = useAuth();
    const { showLoader, hideLoader }: SharedAreaContextModel = useSharedArea();

    const axiosWithCredentials = useCallback<AxiosWithCredentialsFunc>(
        async (config) => {
            let response: AxiosResponse<any, any> | null | AxiosResponse<unknown, any> | undefined = null;
            const userAuthData = getUserAuthDataFromStorage();
            config = config || {};
            config.headers = config.headers || {};
            config.headers = { ...config.headers, ...HttpConstants.Headers.AcceptJson };

            if (userAuthData) {
               config.headers.Authorization = `Bearer ${ userAuthData.token }`;
            }

            try {
                showLoader();
                response = await axios.request(config) as AxiosResponse;
            } catch (error) {
                response = (error as AxiosError).response;
                notify('В процессе выполнения запроса или получения данных от сервера произошла ошибка', 'error', 10000);
            } finally {
                hideLoader();
            }

            return response;
        },
        [getUserAuthDataFromStorage, hideLoader, showLoader],
    );

    const getTestDataAsync = useCallback<GetTestDataAsyncFunc>(async () => {
        const response = await axiosWithCredentials({
            url: `${ routes.host }${ routes.test }`,
            method: HttpConstants.Methods.Get as Method,
            data: {}
        });
        if (response && response.status === HttpConstants.StatusCodes.Ok) {
            return response.data;
        }
        return null;
    }, [axiosWithCredentials]);

    return (
        <AppDataContext.Provider
            value={ {
                getTestDataAsync,
            } }
            { ...props }
        />
    );
}

export { AppDataProvider, useAppData };
