import { Method } from 'axios';
import { useCallback } from 'react';
import { HttpConstants } from '../../constants/app-http-constants';
import { useAuthHttpRequest } from './use-auth-http-request';
import routes from '../../constants/app-api-routes';
import { AdcValueModel } from '../../models/data/adc-value-model';

export type GetAdcValueAsyncFunc = (channel: number) => Promise<AdcValueModel | null>

export type AppDataContextAdcEndpointsModel = {
    getAdcValueAsync: GetAdcValueAsyncFunc
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

    return {
        getAdcValueAsync,
    } as AppDataContextAdcEndpointsModel
}