import { useCallback } from 'react';
import { HttpConstants } from '../../constants/app-http-constants';
import { Method } from 'axios';
import { useAuthHttpRequest } from './use-auth-http-request';
import routes from '../../constants/app-api-routes';
import { MessageModel } from '../../models/data/message-model';
import { OwnerInfoModel } from '../../models/data/owner-info-model';

export type GetAuthCheckDataAsyncFunc = () => Promise<MessageModel | null>;
export type GetOwnerInfoDataAsyncFunc = () => Promise<OwnerInfoModel | null>;


export type AppDataContextAuthCheckEndpointsModel = {
    getAuthCheckDataAsync: GetAuthCheckDataAsyncFunc;

    getOnwnerInfoDataAsync: GetOwnerInfoDataAsyncFunc;
}

export const useAuthData = () => {

    const authHttpRequest = useAuthHttpRequest();

    const getAuthCheckDataAsync = useCallback<GetAuthCheckDataAsyncFunc>(async (): Promise<MessageModel | null> => {
        const response = await authHttpRequest({
            url: `${routes.host}${routes.accountAuthCheck}`,
            method: HttpConstants.Methods.Get as Method,
        }, true);

        if (response && response.status === HttpConstants.StatusCodes.Ok) {

            return response.data as MessageModel;
        }

        return null;
    }, [authHttpRequest]);

    const getOnwnerInfoDataAsync = useCallback<GetOwnerInfoDataAsyncFunc>(async (): Promise<OwnerInfoModel | null> => {
        const response = await authHttpRequest({
            url: `${routes.host}${routes.accountOwnerInfo}`,
            method: HttpConstants.Methods.Get as Method,
        }, true);

        if (response && response.status === HttpConstants.StatusCodes.Ok) {

            return response.data as OwnerInfoModel;
        }

        return null;
    }, [authHttpRequest]);


    return {
        getAuthCheckDataAsync,
        getOnwnerInfoDataAsync
    };
}