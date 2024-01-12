import { Dispatch, createContext, useCallback, useContext, useMemo } from 'react';
import { useAppData } from '../../contexts/app-data/app-data';
import { RegulatorSettingsModel } from '../../models/regulator-settings/regulator-settings-model';
import { HeatingCircuitTypeModel, HeatingCircuitTypes, HeatingCircuitTypesItem } from '../../models/regulator-settings/enums/heating-circuit-type-model';
import { useParams } from 'react-router-dom';
import { useAppSettings } from '../../contexts/app-settings';

type SettingPageContextModel = {
    regulatorSettings: RegulatorSettingsModel | null;
    setRegulatorSettings: Dispatch<React.SetStateAction<RegulatorSettingsModel | null>>;

    circuitId: number;
    currentHeatingCircuitType: HeatingCircuitTypesItem;
    applyDefaultHeatCircuitSettingsAsync: (heatingCircuitType: HeatingCircuitTypeModel) => Promise<void>;
}

const SettingPageContext = createContext({} as SettingPageContextModel);

function SettingPageContextProvider (props: any) {
    const { circuitIdParam } = useParams();
    const { regulatorSettings, setRegulatorSettings } = useAppSettings();

    const circuitId = useMemo(() => {
        return circuitIdParam ? parseInt(circuitIdParam) : 0;
    }, [circuitIdParam]);

    const currentHeatingCircuitType = useMemo(() => {
        return HeatingCircuitTypes.find(t => t.type === regulatorSettings!.heatingCircuits.items[circuitId].type)!;
    }, [circuitId, regulatorSettings]);

    const { getDefaultHeatingCircuitsSettingsAsync, putRegulatorSettingsAsync } = useAppData();

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
                const regulatorSettingsChange = {
                    regulatorSettings: previous,
                    changeLogItem: {
                        dataField: 'all',
                        datetime: new Date(),
                        path: 'regulatorSettings?.heatingCircuits.items',
                        value: ''
                    }
                }

                await putRegulatorSettingsAsync(regulatorSettingsChange);
            })();

            return { ...previous };
        });
    }, [circuitId, getDefaultHeatingCircuitsSettingsAsync, putRegulatorSettingsAsync, setRegulatorSettings]);

    return (
        <SettingPageContext.Provider value={ {
            regulatorSettings,
            setRegulatorSettings,

            currentHeatingCircuitType,
            applyDefaultHeatCircuitSettingsAsync,

            circuitId
        } } { ...props }>
            {props.children}
        </SettingPageContext.Provider>
    );
}

const useSettingPageContext = () => useContext(SettingPageContext);

export { SettingPageContextProvider, useSettingPageContext }