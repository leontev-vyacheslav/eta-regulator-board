import { Method } from 'axios';
import { useCallback } from 'react';
import { HttpConstants } from '../../constants/app-http-constants';
import { useAuthHttpRequest } from './use-auth-http-request';
import routes from '../../constants/app-api-routes';
import { AdcValueModel, TemperatureValueModel } from '../../models/regulator-settings/adc-value-model';

export type GetAdcValueAsyncFunc = (channel: number) => Promise<AdcValueModel | null>;
export type GetTemperatureValueAsyncFunc = (channel: number) => Promise<TemperatureValueModel | null>;

export type AppDataContextAdcEndpointsModel = {
    getAdcValueAsync: GetAdcValueAsyncFunc;
    getTemperatureValueAsync: GetTemperatureValueAsyncFunc;
}

export const useAdcData = () => {
    const authHttpRequest = useAuthHttpRequest();

    const getAdcValueAsync = useCallback<GetAdcValueAsyncFunc>(async (channel: number): Promise<AdcValueModel | null> => {
        const response = await authHttpRequest({
            url: `${routes.host}${routes.adc}/${channel}`,
            method: HttpConstants.Methods.Get as Method,
        }, true);

        if (response && response.status === HttpConstants.StatusCodes.Ok) {

            return response.data as AdcValueModel;
        }

        return null;
    }, [authHttpRequest]);


    const getTemperatureValueAsync = useCallback<GetAdcValueAsyncFunc>(async (channel: number): Promise<TemperatureValueModel | null> => {
        const response = await authHttpRequest({
            url: `${routes.host}${routes.temperature}/${channel}`,
            method: HttpConstants.Methods.Get as Method,
        }, true);

        if (response && response.status === HttpConstants.StatusCodes.Ok) {

            return response.data as TemperatureValueModel;
        }

        return null;
    }, [authHttpRequest]);

    return {
        getAdcValueAsync,
        getTemperatureValueAsync
    } as AppDataContextAdcEndpointsModel
}