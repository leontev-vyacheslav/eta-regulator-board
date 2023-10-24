import { Dispatch, createContext, useContext, useEffect, useState } from 'react';
import { useAppData } from '../../contexts/app-data/app-data';
import { RegulatorSettingsModel } from '../../models/regulator-settings/regulator-settings-model';

type SettingPageContextModel = {
    regulatorSettings: RegulatorSettingsModel | null,

    setRegulatorSettings: Dispatch<React.SetStateAction<RegulatorSettingsModel | null>>
}

const SettingPageContext = createContext({} as SettingPageContextModel);

function SettingPageContextProvider (props: any) {
    const [regulatorSettings, setRegulatorSettings] = useState<RegulatorSettingsModel | null>(null);
    const { getRegulatorSettingsAsync } = useAppData();

    useEffect(() => {
        setTimeout(async() => {
            const regulatorSettings = await getRegulatorSettingsAsync();

            if(regulatorSettings){
                setRegulatorSettings(regulatorSettings)
            }
        }, 100);
    }, [getRegulatorSettingsAsync]);

    return (
        <SettingPageContext.Provider value={ {
            regulatorSettings,
            setRegulatorSettings
        } } { ...props }>
            {props.children}
        </SettingPageContext.Provider>
    );
}

const useSettingPageContext = () => useContext(SettingPageContext);

export { SettingPageContextProvider, useSettingPageContext }