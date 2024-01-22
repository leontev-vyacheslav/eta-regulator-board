import { useCallback } from 'react';
import { useAuthHttpRequest } from './use-auth-http-request';
import { Method } from 'axios';
import { HttpConstants } from '../../constants/app-http-constants';
import routes from '../../constants/app-api-routes';
import { ArchivesModel } from '../../models/regulator-settings/archives-model';
import { ArchivesDatesModel } from '../../models/regulator-settings/archives-dates-model';


export type AppDataContextArchivesEndpointsModel = {
    getArchivesByDateAsync: (date: Date) => Promise<ArchivesModel | null>;
    getArchivesListAsync: () => Promise<ArchivesDatesModel | null>;
}

export const useArchivesData = () => {
    const authHttpRequest = useAuthHttpRequest();

    const getArchivesByDateAsync = useCallback( async (date: Date) => {
        date.setHours(0, 0, 0, 0);

        const response = await authHttpRequest({
            url: `${routes.host}${routes.archives}/${date.toISOString()}`,
            method: HttpConstants.Methods.Get as Method,
        });

        if (response && response.status === HttpConstants.StatusCodes.Ok) {
            return response.data as ArchivesModel;
        }

        return null;
    }, [authHttpRequest]);

    const getArchivesListAsync = useCallback(async () => {
        const response = await authHttpRequest({
            url: `${routes.host}${routes.archives}`,
            method: HttpConstants.Methods.Get as Method,
        });

        if (response && response.status === HttpConstants.StatusCodes.Ok) {
            return response.data as ArchivesDatesModel
        }

        return null;

    }, [authHttpRequest]);

    return {
        getArchivesByDateAsync,
        getArchivesListAsync
    }
};