import { createContext, useContext } from 'react';
import { AppBaseProviderProps } from '../../models/app-base-provider-props';
import { AppDataContextRtcDataTimeEndpointsModel, useRtcDataTimeData } from './use-rtc-datetime-data';
import { AppDataContextRegulatorSettingsEndpointsModel, useRegulatorSettingsData } from './use-regulator-settings-data';
import { AppDataContextAuthCheckEndpointsModel, useAuthData } from './use-auth-data';
import { AppDataContextGpioEndpointsModel, useGpioData } from './use-gpio-data';
import { AppDataContextAdcEndpointsModel, useAdcData } from './use-adc-data';
import { AppDataContextDacEndpointsModel, useDacData } from './use-dac-data';
import { AppDataContextArchivesEndpointsModel, useArchivesData } from './use-archives-data';
import { AppDataContextAccountsEndpointsModel, useAccountsData } from './use-accounts-data';
import { AppDataContextQuickHelpRefernceEndpointsModel, useQuickHelpRefernceData } from './use-quick-help-reference-data';
import { AppDataContextRemoteConnectorsSettingsEndpointsModel, useRemoteConnectorsData } from './use-remote-connectors-data';
import { AppDataContextServicesEndpointsModel, useServicesData } from './use-services-data';

export type AppDataContextModel =  AppDataContextRtcDataTimeEndpointsModel
    & AppDataContextRegulatorSettingsEndpointsModel
    & AppDataContextAuthCheckEndpointsModel
    & AppDataContextGpioEndpointsModel
    & AppDataContextAdcEndpointsModel
    & AppDataContextDacEndpointsModel
    & AppDataContextArchivesEndpointsModel
    & AppDataContextAccountsEndpointsModel
    & AppDataContextQuickHelpRefernceEndpointsModel
    & AppDataContextRemoteConnectorsSettingsEndpointsModel
    & AppDataContextServicesEndpointsModel;

const AppDataContext = createContext<AppDataContextModel>({} as AppDataContextModel);
const useAppData = () => useContext(AppDataContext);

function AppDataProvider (props: AppBaseProviderProps) {
    const rtcDateTime = useRtcDataTimeData();
    const regulatorSettings = useRegulatorSettingsData();
    const auth = useAuthData();
    const gpio  = useGpioData();
    const adc = useAdcData();
    const dac = useDacData();
    const archives = useArchivesData();
    const accounts = useAccountsData();
    const quickHelpRefernce = useQuickHelpRefernceData();
    const remoteConnectors = useRemoteConnectorsData();
    const services = useServicesData();

    return (
        <AppDataContext.Provider
            value={ {
                ...rtcDateTime,
                ...regulatorSettings,
                ...auth,
                ...gpio,
                ...adc,
                ...dac,
                ...archives,
                ...accounts,
                ...quickHelpRefernce,
                ...remoteConnectors,
                ...services
            } }
            { ...props }
        />
    );
}

export { AppDataProvider, useAppData };
