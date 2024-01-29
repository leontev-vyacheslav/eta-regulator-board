import { createContext, useCallback, useContext, useMemo } from 'react';
import { useAppData } from '../../contexts/app-data/app-data';
import { HeatingCircuitTypeModel, HeatingCircuitTypes, HeatingCircuitTypesItem } from '../../models/regulator-settings/enums/heating-circuit-type-model';
import { useParams } from 'react-router-dom';
import { useRegulatorSettings } from '../../contexts/app-regulator-settings';

type SettingPageContextModel = {
    circuitId: number;
    currentHeatingCircuitType: HeatingCircuitTypesItem;
    applyDefaultHeatCircuitSettingsAsync: (heatingCircuitType: HeatingCircuitTypeModel) => Promise<void>;
}

const SettingPageContext = createContext({} as SettingPageContextModel);

function SettingPageContextProvider (props: any) {
    const { circuitIdParam } = useParams();
    const { getDefaultHeatingCircuitsSettingsAsync, putRegulatorSettingsAsync } = useAppData();
    const { regulatorSettings, setRegulatorSettings } = useRegulatorSettings();

    const circuitId = useMemo(() => {
        return circuitIdParam ? parseInt(circuitIdParam) : 0;
    }, [circuitIdParam]);

    const currentHeatingCircuitType = useMemo(() => {
        return HeatingCircuitTypes.find(t => t.type === regulatorSettings!.heatingCircuits.items[circuitId].type)!;
    }, [circuitId, regulatorSettings]);

    const applyDefaultHeatCircuitSettingsAsync = useCallback(async (heatingCircuitType: HeatingCircuitTypeModel) => {
        const heatingCircuitSettings = await getDefaultHeatingCircuitsSettingsAsync(heatingCircuitType);

        setRegulatorSettings(previous => {
            if (!previous) {
                return previous;
            }

            previous!.heatingCircuits.items = circuitId === 0
                ? [
                    heatingCircuitSettings,
                    ...previous!.heatingCircuits.items.filter((_, index) => index !== circuitId),
                ]
                : [
                    ...previous!.heatingCircuits.items.filter((_, index) => index !== circuitId),
                    heatingCircuitSettings,
                ];

            (async () => {
                await putRegulatorSettingsAsync(previous);
            })();

            return { ...previous };
        });
    }, [circuitId, getDefaultHeatingCircuitsSettingsAsync, putRegulatorSettingsAsync, setRegulatorSettings]);

    return (
        <SettingPageContext.Provider value={ {
            circuitId,
            currentHeatingCircuitType,
            applyDefaultHeatCircuitSettingsAsync,
        } } { ...props }>
            {props.children}
        </SettingPageContext.Provider>
    );
}

const useSettingPageContext = () => useContext(SettingPageContext);

export { SettingPageContextProvider, useSettingPageContext }