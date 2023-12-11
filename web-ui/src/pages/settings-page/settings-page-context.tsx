import { Dispatch, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAppData } from '../../contexts/app-data/app-data';
import { RegulatorSettingsModel } from '../../models/regulator-settings/regulator-settings-model';
import { HeatingCircuitTypeModel, HeatingCircuitTypes, HeatingCircuitTypesItem } from '../../models/regulator-settings/enums/heating-circuit-type-model';
import { useParams } from 'react-router-dom';

type SettingPageContextModel = {
    regulatorSettings: RegulatorSettingsModel | null;
    setRegulatorSettings: Dispatch<React.SetStateAction<RegulatorSettingsModel | null>>;

    heatingCircuitType: HeatingCircuitTypeModel | null;
    setHeatingCircuitType: Dispatch<React.SetStateAction<HeatingCircuitTypeModel| null>>;

    refreshRegulatorSettingsAsync: () => Promise<void>;
    currentHeatingCircuitType: HeatingCircuitTypesItem | undefined;
    circuitId: number;
}

const SettingPageContext = createContext({} as SettingPageContextModel);

function SettingPageContextProvider (props: any) {
    const { circuitIdParam } = useParams();

    const circuitId = useMemo(() => {
        return circuitIdParam ? parseInt(circuitIdParam) : 0;
    }, [circuitIdParam]);

    const [regulatorSettings, setRegulatorSettings] = useState<RegulatorSettingsModel | null>(null);
    const [heatingCircuitType, setHeatingCircuitType] = useState<HeatingCircuitTypeModel | null>(null);

    const currentHeatingCircuitType = useMemo(() => {
        return HeatingCircuitTypes.find(t => t.id === heatingCircuitType);
    }, [heatingCircuitType]);

    const { getRegulatorSettingsAsync } = useAppData();

    const refreshRegulatorSettingsAsync = useCallback(async () => {
        const regulatorSettings = await getRegulatorSettingsAsync();

            if(regulatorSettings){
                setRegulatorSettings(regulatorSettings)
            }
    }, [getRegulatorSettingsAsync]);

    useEffect(() => {
        setTimeout(async() => {
            const regulatorSettings = await getRegulatorSettingsAsync();

            if(regulatorSettings){
                setRegulatorSettings(regulatorSettings);
                const heatingCircuitType = regulatorSettings.heatingCircuits.items[circuitId].type;
                setHeatingCircuitType(heatingCircuitType);
            }
        }, 100);
    }, [circuitId, getRegulatorSettingsAsync]);

    return (
        <SettingPageContext.Provider value={ {
            regulatorSettings,
            setRegulatorSettings,

            heatingCircuitType,
            setHeatingCircuitType,

            refreshRegulatorSettingsAsync,

            currentHeatingCircuitType,

            circuitId
        } } { ...props }>
            {props.children}
        </SettingPageContext.Provider>
    );
}

const useSettingPageContext = () => useContext(SettingPageContext);

export { SettingPageContextProvider, useSettingPageContext }