import { useCallback } from 'react';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpConstants } from '../../constants/app-http-constants';
import { useSharedArea } from '../shared-area';
import { SharedAreaContextModel } from '../../models/shared-area-context';
import { useAuth } from '../auth';
import { httpClientBase } from './http-client-base';
import { proclaim } from '../../utils/proclaim';

export type AxiosWithCredentialsFunc = (config: AxiosRequestConfig, suppressLoader?: boolean, suppressShowUnauthorized?: boolean) => Promise<AxiosResponse | undefined>;

export const useAuthHttpRequest = () => {
    const { getUserAuthDataFromStorage, signOut } = useAuth();
    const { showLoader, hideLoader }: SharedAreaContextModel = useSharedArea();

    const axiosWithCredentials = useCallback<AxiosWithCredentialsFunc>(

        async (config: AxiosRequestConfig, suppressLoader: boolean = false, suppressShowUnauthorized: boolean = false) => {
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
                if (response?.status === 401) {
                    await signOut();
                    
                    if (!suppressShowUnauthorized) {
                        proclaim({
                            type: 'error',
                            message: response.data.message,
                        });
                    }
                } else {
                    proclaim({
                        type: 'error',
                        message: 'В процессе выполнения запроса или получения данных от сервера произошла ошибка',
                    });
                }
            } finally {
                if (!suppressLoader) {
                    setTimeout(() => {
                        hideLoader();
                    }, 100);
                  }
            }

            return response;
        },
        [getUserAuthDataFromStorage, hideLoader, showLoader, signOut],

    );

    return axiosWithCredentials
}