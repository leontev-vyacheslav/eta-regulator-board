import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import notify from 'devextreme/ui/notify';
import { AppSettingsContextModel, AppSettingsDataContextModel } from '../models/app-settings-context';
import { AppBaseProviderProps } from '../models/app-base-provider-props';

const AppSettingsContext = createContext<AppSettingsContextModel>({} as AppSettingsContextModel);

const useAppSettings = () => useContext(AppSettingsContext);

function AppSettingsProvider (props: AppBaseProviderProps) {

    const coreInitialAppSettingsData: AppSettingsDataContextModel = {
        workDate: new Date(new Date().setHours(0, 0, 0, 0)),
        isShowFooter: true,
    };

    const initialAppSettingsDataJson =
        localStorage.getItem('appSettingsData') ||
        JSON.stringify(coreInitialAppSettingsData);

    let initialAppSettingsData = JSON.parse(initialAppSettingsDataJson);


    if(!initialAppSettingsData.workDate)  {
        initialAppSettingsData = { ...initialAppSettingsData, ...{ workDate: new Date(new Date().setHours(0, 0, 0, 0)) } };
    }
    else {
        initialAppSettingsData = { ...initialAppSettingsData, ...{ workDate: new Date(initialAppSettingsData.workDate) } };
    }
    
    if(!initialAppSettingsData.isShowFooter)  {
        initialAppSettingsData = { ...initialAppSettingsData, ...{ isShowFooter: true } };
    }

    const [appSettingsData, setAppSettingsData] = useState<AppSettingsDataContextModel>(initialAppSettingsData);

    useEffect(() => {
        localStorage.setItem('appSettingsData', JSON.stringify(appSettingsData));
    }, [appSettingsData]);



    const setWorkDateToday = useCallback(() => {
        setAppSettingsData(previous => {
            const workDate = new Date();
            workDate.setHours(0, 0, 0, 0);
            return { ...previous, workDate: workDate };
        });
        notify('Рабочая дата изменена на текущую', 'success', 5000);
    }, []);

    return <AppSettingsContext.Provider value={ {
        appSettingsData,
        setAppSettingsData,
        setWorkDateToday } } { ...props } />;
}

export { AppSettingsProvider, useAppSettings };
