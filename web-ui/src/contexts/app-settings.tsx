import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppSettingsContextModel, AppSettingsDataContextModel } from '../models/app-settings-context';
import { AppBaseProviderProps } from '../models/app-base-provider-props';
import { useAppData } from './app-data/app-data';
import { RegulatorSettingsModel } from '../models/regulator-settings/regulator-settings-model';
import { useAuth } from './auth';
import { HeatingCircuitIndexModel } from '../models/regulator-settings/enums/heating-circuit-type-model';
import { ControlModes } from '../models/regulator-settings/enums/control-mode-model';

const AppSettingsContext = createContext<AppSettingsContextModel>({} as AppSettingsContextModel);

const useAppSettings = () => useContext(AppSettingsContext);

function AppSettingsProvider(props: AppBaseProviderProps) {
    const { user } = useAuth();
    const { getRtcDateTimeAsync, getRegulatorSettingsAsync } = useAppData();

    const [regulatorSettings, setRegulatorSettings] = useState<RegulatorSettingsModel | null>(null);
    const [appSettingsData, setAppSettingsData] = useState<AppSettingsDataContextModel>({
        isShowFooter: true,
    });

    const getHeatingCircuitName = useCallback((heatingCircuitIndex: HeatingCircuitIndexModel) => {

        return regulatorSettings
            ? regulatorSettings.heatingCircuits.items[heatingCircuitIndex].name
            : `Контур ${heatingCircuitIndex + 1}`;
    }, [regulatorSettings]);

    const getControlModeName = useCallback((heatingCircuitIndex: HeatingCircuitIndexModel) => {

        return regulatorSettings
            ? ControlModes.find(m => m.id === regulatorSettings.heatingCircuits.items[heatingCircuitIndex].regulatorParameters.controlParameters.controlMode)!.description
            : ''
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
            // don't delete this artificial dependency from 'user'
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
        getHeatingCircuitName,
        getControlModeName
       } } { ...props } />;
}

export { AppSettingsProvider, useAppSettings };
