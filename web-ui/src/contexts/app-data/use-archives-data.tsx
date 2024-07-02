import { useCallback } from 'react';
import { useAuthHttpRequest } from './use-auth-http-request';
import { Method } from 'axios';
import { HttpConstants } from '../../constants/app-http-constants';
import routes from '../../constants/app-api-routes';
import { ArchivesModel } from '../../models/regulator-settings/archives-model';
import { ArchiveExistsModel } from '../../models/regulator-settings/archive-model';


export type AppDataContextArchivesEndpointsModel = {
    getArchivesByDateAsync: (circuitId: number, date: Date) => Promise<ArchivesModel | null>;
    getExistsArchivesByDateAsync: (circuitId: number, date: Date) => Promise<ArchiveExistsModel | null>;
    getArchivesByDateAsFile: (circuitId: number, date: Date) => Promise<any>;
}

export const useArchivesData = () => {
    const authHttpRequest = useAuthHttpRequest();

    const getArchivesByDateAsync = useCallback(async (circuitId: number, date: Date) => {
        // date.setHours(0, 0, 0, 0);

        const response = await authHttpRequest({
            url: `${routes.host}${routes.archives}/${circuitId}/${date.toISOString()}`,
            method: HttpConstants.Methods.Get as Method,
        });

        if (response && response.status === HttpConstants.StatusCodes.Ok) {
            return response.data as ArchivesModel;
        }

        return null;
    }, [authHttpRequest]);

    const getExistsArchivesByDateAsync = useCallback(async (circuitId: number, date: Date) => {
        // date.setHours(0, 0, 0, 0);

        const response = await authHttpRequest({
            url: `${routes.host}${routes.archives}/exists/${circuitId}/${date.toISOString()}`,
            method: HttpConstants.Methods.Get as Method,
        });

        if (response && response.status === HttpConstants.StatusCodes.Ok) {
            return response.data as ArchiveExistsModel;
        }

        return null;
    }, [authHttpRequest]);


    const getArchivesByDateAsFile = useCallback<(circuitId: number, date: Date) => Promise<any>>(async (circuitId: number, date: Date) => {
        const response = await authHttpRequest({
            url: `${routes.host}${routes.archives}/download/${circuitId}/${date.toISOString()}`,
            responseType: 'blob',
            method: HttpConstants.Methods.Get as Method,
        });

        if (response && response.status === HttpConstants.StatusCodes.Ok) {

            return response.data;
        }

        return null;
    }, [authHttpRequest]);

    return {
        getArchivesByDateAsync,
        getExistsArchivesByDateAsync,
        getArchivesByDateAsFile
    }
};