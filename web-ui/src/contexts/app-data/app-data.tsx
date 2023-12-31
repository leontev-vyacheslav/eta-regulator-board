import { createContext, useContext } from 'react';
import { AppBaseProviderProps } from '../../models/app-base-provider-props';
import { AppDataContextTestListEndpointsModel, useTestListData } from './use-test-list-data';
import { AppDataContextRtcDataTimeEndpointsModel, useRtcDataTimeData } from './use-rtc-datatime-data';
import { AppDataContextRegulatorSettingsEndpointsModel, useRegulatorSettingsData } from './use-regulator-settings-data';
import { AppDataContextAuthCheckEndpointsModel, useAuthData } from './use-auth-data';
import { AppDataContextGpioEndpointsModel, useGpioData } from './use-gpio-data';
import { AppDataContextAdcEndpointsModel, useAdcData } from './use-adc-data';
import { AppDataContextDacEndpointsModel, useDacData } from './use-dac-data';

export type AppDataContextModel = AppDataContextTestListEndpointsModel
    & AppDataContextRtcDataTimeEndpointsModel
    & AppDataContextRegulatorSettingsEndpointsModel
    & AppDataContextAuthCheckEndpointsModel
    & AppDataContextGpioEndpointsModel
    & AppDataContextAdcEndpointsModel
    & AppDataContextDacEndpointsModel ;

const AppDataContext = createContext<AppDataContextModel>({} as AppDataContextModel);
const useAppData = () => useContext(AppDataContext);

function AppDataProvider (props: AppBaseProviderProps) {
    const testListData = useTestListData();
    const rtcDateTimeData = useRtcDataTimeData();
    const regulatorSettingsData = useRegulatorSettingsData();
    const authData = useAuthData();
    const gpioData  = useGpioData();
    const adcData = useAdcData();
    const dacData = useDacData();

    return (
        <AppDataContext.Provider
            value={ {
                ...testListData,
                ...rtcDateTimeData,
                ...regulatorSettingsData,
                ...authData,
                ...gpioData,
                ...adcData,
                ...dacData
            } }
            { ...props }
        />
    );
}

export { AppDataProvider, useAppData };
