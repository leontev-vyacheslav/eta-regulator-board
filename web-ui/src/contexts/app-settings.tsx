import React, { createContext, useContext, useEffect, useState } from 'react';
// import notify from 'devextreme/ui/notify';
import { AppSettingsContextModel, AppSettingsDataContextModel } from '../models/app-settings-context';
import { AppBaseProviderProps } from '../models/app-base-provider-props';
import { useAppData } from './app-data/app-data';

const AppSettingsContext = createContext<AppSettingsContextModel>({} as AppSettingsContextModel);

const useAppSettings = () => useContext(AppSettingsContext);

function AppSettingsProvider(props: AppBaseProviderProps) {
    const { getRtcDateTimeAsync } = useAppData();

    const [appSettingsData, setAppSettingsData] = useState<AppSettingsDataContextModel>({
        isShowFooter: true,
    });

    useEffect(() => {
        (async () => {
            const rtcDateTime = await getRtcDateTimeAsync();
            if (rtcDateTime) {
                setAppSettingsData(previous => {
                    return { ...previous, workDate: rtcDateTime.datetime };
                });
            }
        })();

    }, [getRtcDateTimeAsync]);


    return <AppSettingsContext.Provider value={ {
        appSettingsData,
        setAppSettingsData
    } } { ...props } />;
}

export { AppSettingsProvider, useAppSettings };
