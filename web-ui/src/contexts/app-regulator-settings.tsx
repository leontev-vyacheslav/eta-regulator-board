import { Dispatch, SetStateAction, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { HeatingCircuitIndexModel } from '../models/regulator-settings/enums/heating-circuit-type-model';
import { RegulatorSettingsModel } from '../models/regulator-settings/regulator-settings-model';
import { ControlModes } from '../models/regulator-settings/enums/control-mode-model';
import { useAppData } from './app-data/app-data';
import { useAuth } from './auth';

export type RegulatorSettingsContextModel = {
    regulatorSettings: RegulatorSettingsModel | null;

    setRegulatorSettings: Dispatch<SetStateAction<RegulatorSettingsModel | null>>;

    refreshRegulatorSettingsAsync: () => Promise<void>;

    getHeatingCircuitName: (heatingCircuitIndex: HeatingCircuitIndexModel) => string;

    getControlModeName: (heatingCircuitIndex: HeatingCircuitIndexModel) => string;
};

const RegulatorSettingsContext = createContext({} as RegulatorSettingsContextModel);

function RegulatorSettingsProvider({ children }: any) {
    const { user } = useAuth();
    const { getRegulatorSettingsAsync } = useAppData();

    const [regulatorSettings, setRegulatorSettings] = useState<RegulatorSettingsModel | null>(null);

    const getHeatingCircuitName = useCallback((heatingCircuitIndex: HeatingCircuitIndexModel) => {

        return regulatorSettings
            ? regulatorSettings.heatingCircuits.items[heatingCircuitIndex].name
            : `Контур ${heatingCircuitIndex + 1}`;
    }, [regulatorSettings]);

    const getControlModeName = useCallback((heatingCircuitIndex: HeatingCircuitIndexModel) => {

        return regulatorSettings
            ? ControlModes.find(
                m => m.id === regulatorSettings.heatingCircuits.items[heatingCircuitIndex].regulatorParameters.controlParameters.controlMode
            )!.description
            : ''
    }, [regulatorSettings]);

    const refreshRegulatorSettingsAsync = useCallback(async () => {
        const regulatorSettings = await getRegulatorSettingsAsync();

        if (regulatorSettings) {
            setRegulatorSettings(regulatorSettings)
        }
    }, [getRegulatorSettingsAsync]);

    useEffect(() => {
        (async () => {
            if (!user) {
                return;
            }

            const regulatorSettings = await getRegulatorSettingsAsync();
            // don't delete this artificial dependency from 'user'
            if (regulatorSettings) {
                setRegulatorSettings(regulatorSettings);
            }
        })();
    }, [getRegulatorSettingsAsync, user]);

    return (
        <RegulatorSettingsContext.Provider value={
            {
                regulatorSettings,
                setRegulatorSettings,
                getControlModeName,
                getHeatingCircuitName,
                refreshRegulatorSettingsAsync
            }
        }>
            {children}
        </RegulatorSettingsContext.Provider>
    );
}

const useRegulatorSettings = () => useContext(RegulatorSettingsContext);

export { RegulatorSettingsProvider, useRegulatorSettings };