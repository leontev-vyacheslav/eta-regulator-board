import { Method } from 'axios';
import { useCallback } from 'react';
import { useAuthHttpRequest } from './use-auth-http-request';
import { RegulatorSettingsModel } from '../../models/regulator-settings/regulator-settings-model';
import { HttpConstants } from '../../constants/app-http-constants';
import routes from '../../constants/app-api-routes';


export type GetRegulatorSettingsAsyncFunc = () => Promise<RegulatorSettingsModel | null>;

export type AppDataContextRegulatorSettingsEndpointsModel = {
    getRegulatorSettingsAsync: GetRegulatorSettingsAsyncFunc;
}

export const useRegulatorSettingsData = () => {
    const authHttpRequest = useAuthHttpRequest();

    const getRegulatorSettingsAsync = useCallback(async () => {
        const response = await authHttpRequest({
            url: `${routes.host}${routes.regulatorSettings}`,
            method: HttpConstants.Methods.Get as Method,
        });

        if (response && response.status === HttpConstants.StatusCodes.Ok) {

            return response.data as RegulatorSettingsModel;
        }

        return null;
    }, [authHttpRequest]);

    return {
        getRegulatorSettingsAsync
    } as AppDataContextRegulatorSettingsEndpointsModel;
}