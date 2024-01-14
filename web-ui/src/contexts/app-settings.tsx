import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppSettingsContextModel, AppSettingsDataContextModel } from '../models/app-settings-context';
import { AppBaseProviderProps } from '../models/app-base-provider-props';
import { useAppData } from './app-data/app-data';
import { RegulatorSettingsModel } from '../models/regulator-settings/regulator-settings-model';
import { useAuth } from './auth';
import { HeatingCircuitIndexModel } from '../models/regulator-settings/enums/heating-circuit-type-model';

const AppSettingsContext = createContext<AppSettingsContextModel>({} as AppSettingsContextModel);

const useAppSettings = () => useContext(AppSettingsContext);

function AppSettingsProvider(props: AppBaseProviderProps) {
    const { user } = useAuth();
    const { getRtcDateTimeAsync, getRegulatorSettingsAsync } = useAppData();

    const [regulatorSettings, setRegulatorSettings] = useState<RegulatorSettingsModel | null>(null);
    const [appSettingsData, setAppSettingsData] = useState<AppSettingsDataContextModel>({
        isShowFooter: true,
    });

    const getHeatingCircuitName = useCallback((index: HeatingCircuitIndexModel) => {

        return regulatorSettings
            ? regulatorSettings.heatingCircuits.items[index].name
            : `Контур ${index + 1}`;
    }, [regulatorSettings]);

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

    const refreshRegulatorSettingsAsync = useCallback(async () => {
        const regulatorSettings = await getRegulatorSettingsAsync();

        if (regulatorSettings) {
            setRegulatorSettings(regulatorSettings)
        }
    }, [getRegulatorSettingsAsync]);

    useEffect(() => {
        (async () => {
            const regulatorSettings = await getRegulatorSettingsAsync();
            // don't delete an artificial dependency from 'user'
            if (regulatorSettings && user) {
                setRegulatorSettings(regulatorSettings);
            }
        })();
    }, [getRegulatorSettingsAsync, user]);

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

        regulatorSettings,
        setRegulatorSettings,
        refreshRegulatorSettingsAsync,
        getHeatingCircuitName
    } } { ...props } />;
}

export { AppSettingsProvider, useAppSettings };
