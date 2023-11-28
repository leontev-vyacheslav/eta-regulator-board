import { useCallback } from 'react';
import { Method } from 'axios';
import { HttpConstants } from '../../constants/app-http-constants';
import routes from '../../constants/app-api-routes';
import { useAuthHttpRequest } from './use-auth-http-request';


export type ActiveSignalGenModel = {
    pid: number;
    signalId: number,
    lifetime: number
};

export type GetStartedSignalGenAsyncFunc = (signalId: number, lifetime: number) => Promise<ActiveSignalGenModel | null>;
export type GetActiveSignalGenAsyncFunc = () => Promise<ActiveSignalGenModel | null>;
export type DeleteActiveSignalGenAsyncFunc = () => Promise<ActiveSignalGenModel | null>;

export type AppDataContextDacEndpointsModel = {
    getStartedSignalGenAsync: GetStartedSignalGenAsyncFunc;
    getActiveSignalGenAsync: GetActiveSignalGenAsyncFunc;
    deleteActiveSignalGenAsync: DeleteActiveSignalGenAsyncFunc;
}

export const useDacData = () => {
    const authHttpRequest = useAuthHttpRequest();

    const getStartedSignalGenAsync = useCallback<GetStartedSignalGenAsyncFunc>(async (signalId: number, lifetime: number) => {
        const response = await authHttpRequest({
            url: `${routes.host}${routes.dac}/signal/${signalId}/${lifetime}`,
            method: HttpConstants.Methods.Get as Method,
        }, true);

        if (response && response.status === HttpConstants.StatusCodes.Ok) {
            return response.data as ActiveSignalGenModel;
        }

        return null;
    }, [authHttpRequest]);

    const getActiveSignalGenAsync = useCallback<GetActiveSignalGenAsyncFunc>(async () => {
        const response = await authHttpRequest({
            url: `${routes.host}${routes.dac}/signal`,
            method: HttpConstants.Methods.Get as Method,
        }, true);

        if (response && response.status === HttpConstants.StatusCodes.Ok) {
            return response.data as ActiveSignalGenModel;
        }

        return null;
    }, [authHttpRequest]);

    const deleteActiveSignalGenAsync = useCallback<DeleteActiveSignalGenAsyncFunc>(async () => {
        const response = await authHttpRequest({
            url: `${routes.host}${routes.dac}/signal`,
            method: HttpConstants.Methods.Delete as Method,
        }, true);

        if (response && response.status === HttpConstants.StatusCodes.Ok) {
            return response.data as ActiveSignalGenModel;
        }

        return null;
    }, [authHttpRequest]);

    return {
        getStartedSignalGenAsync,
        getActiveSignalGenAsync,
        deleteActiveSignalGenAsync
    } as AppDataContextDacEndpointsModel;
}

