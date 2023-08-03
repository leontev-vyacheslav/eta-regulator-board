import { createContext, useCallback, useContext } from 'react';
import routes from '../constants/app-api-routes';
import { useAuth } from './auth';
import { useSharedArea } from './shared-area';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { HttpConstants } from '../constants/app-http-constants';
import notify from 'devextreme/ui/notify';
import { SharedAreaContextModel } from '../models/shared-area-context';
import { AppBaseProviderProps } from '../models/app-base-provider-props';
import { TestListModel } from '../models/data/test-list-model';
import { TestModel } from '../models/data/test-model';

export type AxiosWithCredentialsFunc = (config: AxiosRequestConfig) => Promise<AxiosResponse | undefined>;
export type GetTestListDataAsyncFunc = () => Promise<TestListModel | null> ;
export type PostTestDataAsyncFunc = (testModel: TestModel) => Promise<TestModel | null> ;


export type AppDataContextModel = {
    getTestListDataAsync: GetTestListDataAsyncFunc,
    postTestDataAsync: PostTestDataAsyncFunc
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

    const getTestListDataAsync = useCallback<GetTestListDataAsyncFunc>(async (): Promise<TestListModel | null> => {
        const response = await axiosWithCredentials({
            url: `${ routes.host }${ routes.tests }/list`,
            method: HttpConstants.Methods.Get as Method,
            data: {}
        });

        if (response && response.status === HttpConstants.StatusCodes.Ok) {

            return response.data as TestListModel;
        }

        return null;
    }, [axiosWithCredentials]);


    const postTestDataAsync = useCallback<PostTestDataAsyncFunc>(async (testModel: TestModel): Promise<TestModel | null> => {

        const response = await axiosWithCredentials({
            url: `${ routes.host }${ routes.tests }/post`,
            method: HttpConstants.Methods.Post as Method,
            data: testModel
        });

        if (response && response.status === HttpConstants.StatusCodes.Ok) {

            return response.data as TestModel;
        }

        return null;
    }, [axiosWithCredentials]);

    return (
        <AppDataContext.Provider
            value={ {
                getTestListDataAsync,
                postTestDataAsync
            } }
            { ...props }
        />
    );
}

export { AppDataProvider, useAppData };
