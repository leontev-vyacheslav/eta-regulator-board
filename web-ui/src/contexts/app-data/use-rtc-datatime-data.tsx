import { useCallback } from 'react';
import { RtcDateTimeModel } from '../../models/data/rtc-datetime-model';
import { HttpConstants } from '../../constants/app-http-constants';
import routes from '../../constants/app-api-routes';
import { Method } from 'axios';
import { useAuthHttpRequest } from './use-auth-http-request';

export type GetRtcDatetimeAsyncFunc = () => Promise<RtcDateTimeModel | null>;

export type AppDataContextRtcDataTimeEndpointsModel = {
    getRtcDateTimeAsync: GetRtcDatetimeAsyncFunc;
}

export const useRtcDataTimeData = () => {
    const authHttpRequest = useAuthHttpRequest();

    const getRtcDateTimeAsync = useCallback<GetRtcDatetimeAsyncFunc>(async () => {
        const response = await authHttpRequest({
            url: `${routes.host}${routes.rtc}`,
            method: HttpConstants.Methods.Get as Method,
        }, true);

        if (response && response.status === HttpConstants.StatusCodes.Ok) {

            return response.data as RtcDateTimeModel;
        }

        return null;
    }, [authHttpRequest]);

    return {
        getRtcDateTimeAsync
    }
}


