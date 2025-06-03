import { useCallback } from 'react';
import { HttpConstants } from '../../constants/app-http-constants';
import routes from '../../constants/app-api-routes';
import { Method } from 'axios';
import { useAuthHttpRequest } from './use-auth-http-request';
import { RemoteConnectorsSettingsModel } from '../../models/remote-connectors-settings/remote-connectors-settings-model';

export type GetRemoteConnectorsSettingsModelFunc = () => Promise<RemoteConnectorsSettingsModel | null>;
export type PutRemoteConnectorsSettingsModelFunc = (settings: RemoteConnectorsSettingsModel) => Promise<RemoteConnectorsSettingsModel | null>;

export type AppDataContextRemoteConnectorsSettingsEndpointsModel = {
    getRemoteConnectorsSettingsAsync: GetRemoteConnectorsSettingsModelFunc;
    putRemoteConnectorsSettingsAsync: PutRemoteConnectorsSettingsModelFunc;
}

export const useRemoteConnectorsData = () => {
    const authHttpRequest = useAuthHttpRequest();

    const getRemoteConnectorsSettingsAsync = useCallback<GetRemoteConnectorsSettingsModelFunc>(async () => {
        const response = await authHttpRequest({
            url: `${routes.host}${routes.remoteConnectors}`,
            method: HttpConstants.Methods.Get as Method,
        });

        if (response && response.status === HttpConstants.StatusCodes.Ok) {
            const settings = response.data as RemoteConnectorsSettingsModel;

            return settings;
        }

        return null;
    }, [authHttpRequest]);

        const putRemoteConnectorsSettingsAsync = useCallback<PutRemoteConnectorsSettingsModelFunc>(async (settings: RemoteConnectorsSettingsModel) => {
            const response = await authHttpRequest({
                url: `${routes.host}${routes.remoteConnectors}`,
                method: HttpConstants.Methods.Put as Method,
                data: settings
            }, true);

            if (response && response.status === HttpConstants.StatusCodes.Ok) {

                return response.data;
            }

            return null;
        }, [authHttpRequest]);

    return {
        getRemoteConnectorsSettingsAsync,
        putRemoteConnectorsSettingsAsync
    }
}

