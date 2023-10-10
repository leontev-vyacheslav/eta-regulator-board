import { Method } from 'axios';
import { useCallback } from 'react';
import { HttpConstants } from '../../constants/app-http-constants';
import { useAuthHttpRequest } from './use-auth-http-request';
import routes from '../../constants/app-api-routes';
import { GpioItemModel, GpioSetModel } from '../../models/regulator-settings/gpio-set-model';

export type PutGpioAsyncFunc = (pin: number, state: boolean) => Promise<GpioItemModel | null>;
export type GetGpioAllAsyncFunc = () => Promise<GpioSetModel | null>

export type AppDataContextGpioEndpointsModel = {
    putGpioAsync: PutGpioAsyncFunc;
    getGpioAllAsync: GetGpioAllAsyncFunc
}

export const useGpioData = () => {
    const authHttpRequest = useAuthHttpRequest();

    const putGpioAsync = useCallback<PutGpioAsyncFunc>(async (pin: number, state: boolean): Promise<GpioItemModel | null> => {
        const response = await authHttpRequest({
            url: `${routes.host}${routes.gpio}/${pin}/${state}`,
            method: HttpConstants.Methods.Put as Method,
        });

        if (response && response.status === HttpConstants.StatusCodes.Ok) {

            return response.data as GpioItemModel;
        }

        return null;
    }, [authHttpRequest]);

    const getGpioAllAsync = useCallback<GetGpioAllAsyncFunc>(async (): Promise<GpioSetModel | null> => {
        const response = await authHttpRequest({
            url: `${routes.host}${routes.gpio}/all`,
            method: HttpConstants.Methods.Get as Method,
        });

        if (response && response.status === HttpConstants.StatusCodes.Ok) {

            return response.data as GpioSetModel;
        }

        return null;
    }, [authHttpRequest]);

    return {
        putGpioAsync,
        getGpioAllAsync
    } as AppDataContextGpioEndpointsModel
}