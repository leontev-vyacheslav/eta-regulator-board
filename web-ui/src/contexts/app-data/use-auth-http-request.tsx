import { useCallback } from 'react';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpConstants } from '../../constants/app-http-constants';
import { useSharedArea } from '../shared-area';
import { SharedAreaContextModel } from '../../models/shared-area-context';
import notify from 'devextreme/ui/notify';
import { useAuth } from '../auth';
import { httpClientBase } from './http-client-base';

export type AxiosWithCredentialsFunc = (config: AxiosRequestConfig, suppressLoader?: boolean) => Promise<AxiosResponse | undefined>;

export const useAuthHttpRequest = () => {

    const { getUserAuthDataFromStorage } = useAuth();
    const { showLoader, hideLoader }: SharedAreaContextModel = useSharedArea();

    const axiosWithCredentials = useCallback<AxiosWithCredentialsFunc>(

        async (config: AxiosRequestConfig, suppressLoader: boolean = false) => {
            let response: AxiosResponse<any, any> | null | AxiosResponse<unknown, any> | undefined = null;
            const userAuthData = getUserAuthDataFromStorage();
            config = config || {};
            config.headers = config.headers || {};
            config.headers = { ...config.headers, ...HttpConstants.Headers.AcceptJson };

            if (userAuthData) {
                config.headers.Authorization = `Bearer ${userAuthData.token}`;
            }

            try {
                if (!suppressLoader) {
                    showLoader();
                }

                response = await httpClientBase.request(config) as AxiosResponse;
            } catch (error) {
                response = (error as AxiosError).response;
                notify('В процессе выполнения запроса или получения данных от сервера произошла ошибка', 'error', 10000);
            } finally {
                if (!suppressLoader) {
                    setTimeout(() => {
                        hideLoader();
                    }, 500);
                  }
            }

            return response;
        },
        [getUserAuthDataFromStorage, hideLoader, showLoader],

    );

    return axiosWithCredentials
}