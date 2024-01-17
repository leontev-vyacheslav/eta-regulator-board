import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppSettingsContextModel, AppSettingsDataContextModel } from '../models/app-settings-context';
import { AppBaseProviderProps } from '../models/app-base-provider-props';
import { useAppData } from './app-data/app-data';
import { useAuth } from './auth';

const AppSettingsContext = createContext<AppSettingsContextModel>({} as AppSettingsContextModel);

const useAppSettings = () => useContext(AppSettingsContext);

function AppSettingsProvider(props: AppBaseProviderProps) {
    const { user } = useAuth();
    const { getRtcDateTimeAsync } = useAppData();

    const [appSettingsData, setAppSettingsData] = useState<AppSettingsDataContextModel>({
        isShowFooter: true,
    });

    const updateWorkDateAsync = useCallback(async () => {
        if (!user) {

            return;
        }

        const rtcDateTime = await getRtcDateTimeAsync();
        if (rtcDateTime) {
            setAppSettingsData(previous => {
                return { ...previous, workDate: rtcDateTime.datetime };
            });
        }
    }, [getRtcDateTimeAsync, user]);

    useEffect(() => {
        (async () => {
            await updateWorkDateAsync();
        })();
    }, [updateWorkDateAsync]);

    useEffect(() => {
        const intervalTimer = setInterval(async () => {
            await updateWorkDateAsync();
        }, 60000);

        return () => clearInterval(intervalTimer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <AppSettingsContext.Provider value={ {
        appSettingsData,
        setAppSettingsData,
        updateWorkDateAsync,
       } } { ...props } />;
}

export { AppSettingsProvider, useAppSettings };
