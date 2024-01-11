import { Method } from 'axios';
import { useCallback } from 'react';
import { useAuthHttpRequest } from './use-auth-http-request';
import { RegulatorSettingsChangeModel, RegulatorSettingsModel } from '../../models/regulator-settings/regulator-settings-model';
import { HttpConstants } from '../../constants/app-http-constants';
import routes from '../../constants/app-api-routes';
import { HeatingCircuitModel } from '../../models/regulator-settings/heating-circuits-model';
import { HeatingCircuitTypeModel } from '../../models/regulator-settings/enums/heating-circuit-type-model';


export type GetRegulatorSettingsAsyncFunc = () => Promise<RegulatorSettingsModel | null>;
export type PutRegulatorSettingsAsyncFunc = (regulatorSettingsChange: RegulatorSettingsChangeModel) => Promise<RegulatorSettingsModel | null>;
export type GetRegulatorSettingsAsFileAsyncFunc = () => Promise<any>;
export type GetDefaultHeatingCircuitsSettingsAsyncFunc = (heatingCircuitType: HeatingCircuitTypeModel) => Promise<HeatingCircuitModel>;

export type AppDataContextRegulatorSettingsEndpointsModel = {
    getRegulatorSettingsAsync: GetRegulatorSettingsAsyncFunc;
    putRegulatorSettingsAsync: PutRegulatorSettingsAsyncFunc;
    getRegulatorSettingsAsFile: GetRegulatorSettingsAsFileAsyncFunc;
    getDefaultHeatingCircuitsSettingsAsync: GetDefaultHeatingCircuitsSettingsAsyncFunc;
}

export const useRegulatorSettingsData = () => {
    const authHttpRequest = useAuthHttpRequest();

    const getRegulatorSettingsAsync = useCallback<GetRegulatorSettingsAsyncFunc>(async () => {
        const response = await authHttpRequest({
            url: `${routes.host}${routes.regulatorSettings}`,
            method: HttpConstants.Methods.Get as Method,
        }, false, true );

        if (response && response.status === HttpConstants.StatusCodes.Ok) {

            return response.data as RegulatorSettingsModel;
        }

        return null;
    }, [authHttpRequest]);

    const putRegulatorSettingsAsync = useCallback<PutRegulatorSettingsAsyncFunc>(async (regulatorSettingsChange: RegulatorSettingsChangeModel) => {
        const response = await authHttpRequest({
            url: `${routes.host}${routes.regulatorSettings}`,
            method: HttpConstants.Methods.Put as Method,
            data: regulatorSettingsChange
        }, true);

        if (response && response.status === HttpConstants.StatusCodes.Ok) {

            return response.data as RegulatorSettingsModel;
        }

        return null;
    }, [authHttpRequest]);

    const getRegulatorSettingsAsFile = useCallback<GetRegulatorSettingsAsFileAsyncFunc>(async () => {
        const response = await authHttpRequest({
            url: `${routes.host}${routes.regulatorSettings}/download`,
            responseType: 'blob',
            method: HttpConstants.Methods.Get as Method,
        });

        if (response && response.status === HttpConstants.StatusCodes.Ok) {

            return response.data;
        }

        return null;
    }, [authHttpRequest]);

    const getDefaultHeatingCircuitsSettingsAsync = useCallback<any>(async (heatingCircuitType: HeatingCircuitTypeModel ) => {
        const response = await authHttpRequest({
            url: `${routes.host}${routes.regulatorSettings}/default/${heatingCircuitType}`,
            method: HttpConstants.Methods.Get as Method,
        });

        if (response && response.status === HttpConstants.StatusCodes.Ok) {

            return response.data;
        }

        return null;
    }, [authHttpRequest]);

    return {
        getRegulatorSettingsAsync,
        putRegulatorSettingsAsync,
        getRegulatorSettingsAsFile,
        getDefaultHeatingCircuitsSettingsAsync
    } as AppDataContextRegulatorSettingsEndpointsModel;
}