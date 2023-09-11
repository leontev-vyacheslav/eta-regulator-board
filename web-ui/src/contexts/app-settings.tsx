import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import notify from 'devextreme/ui/notify';
import { AppSettingsContextModel, AppSettingsDataContextModel } from '../models/app-settings-context';
import { AppBaseProviderProps } from '../models/app-base-provider-props';
import { useAppData } from './app-data/app-data';

const AppSettingsContext = createContext<AppSettingsContextModel>({} as AppSettingsContextModel);

const useAppSettings = () => useContext(AppSettingsContext);

function AppSettingsProvider(props: AppBaseProviderProps) {
    const { getRtcDateTimeAsync } = useAppData();

    const [appSettingsData, setAppSettingsData] = useState<AppSettingsDataContextModel>({
        workDate: new Date(),
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

    // const coreInitialAppSettingsData: AppSettingsDataContextModel = {
    //     workDate: new Date(new Date().setHours(0, 0, 0, 0)),
    //     isShowFooter: true,
    // };

    // const initialAppSettingsDataJson =
    //     localStorage.getItem('appSettingsData') ||
    //     JSON.stringify(coreInitialAppSettingsData);

    // let initialAppSettingsData = JSON.parse(initialAppSettingsDataJson);


    // if(!initialAppSettingsData.workDate)  {
    //     initialAppSettingsData = { ...initialAppSettingsData, ...{ workDate: new Date(new Date().setHours(0, 0, 0, 0)) } };
    // }
    // else {
    //     initialAppSettingsData = { ...initialAppSettingsData, ...{ workDate: new Date(new Date().setHours(0, 0, 0, 0)) } };
    // }

    // if(!initialAppSettingsData.isShowFooter)  {
    //     initialAppSettingsData = { ...initialAppSettingsData, ...{ isShowFooter: true } };
    // }

    // useEffect(() => {
    //     localStorage.setItem('appSettingsData', JSON.stringify(appSettingsData));
    // }, [appSettingsData]);


    const setWorkDateToday = useCallback(() => {
        setAppSettingsData(previous => {
            const workDate = new Date();
            return { ...previous, workDate: workDate };
        });
        notify('Рабочая дата изменена на текущую', 'success', 5000);
    }, []);

    return <AppSettingsContext.Provider value={ {
        appSettingsData,
        setAppSettingsData,
        setWorkDateToday
    } } { ...props } />;
}

export { AppSettingsProvider, useAppSettings };
