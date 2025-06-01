import { useCallback } from 'react';
import { HttpConstants } from '../../constants/app-http-constants';
import routes from '../../constants/app-api-routes';
import { Method } from 'axios';
import { useAuthHttpRequest } from './use-auth-http-request';
import { RemoteConnectorsSettingsModel } from '../../models/remote-connectors-settings/remote-connectors-settings-model';

export type RemoteConnectorsSettingsModelFunc = () => Promise<RemoteConnectorsSettingsModel | null>;

export type AppDataContextRemoteConnectorsSettingsEndpointsModel = {
    getRemoteConnectorsSettingsAsync: RemoteConnectorsSettingsModelFunc;
}

export const useRemoteConnectorsData = () => {
    const authHttpRequest = useAuthHttpRequest();

    const getRemoteConnectorsSettingsAsync = useCallback<RemoteConnectorsSettingsModelFunc>(async () => {
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

    return {
        getRemoteConnectorsSettingsAsync
    }
}

