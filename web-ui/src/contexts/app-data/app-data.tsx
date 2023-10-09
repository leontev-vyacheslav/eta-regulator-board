import { createContext, useContext } from 'react';
import { AppBaseProviderProps } from '../../models/app-base-provider-props';
import { AppDataContextTestListEndpointsModel, useTestListData } from './use-test-list-data';
import { AppDataContextRtcDataTimeEndpointsModel, useRtcDataTimeData } from './use-rtc-datatime-data';
import { AppDataContextRegulatorSettingsEndpointsModel, useRegulatorSettingsData } from './use-regulator-settings-data';
import { AppDataContextAuthCheckEndpointsModel, useAuthData } from './use-auth-data';

export type AppDataContextModel = AppDataContextTestListEndpointsModel
    & AppDataContextRtcDataTimeEndpointsModel
    & AppDataContextRegulatorSettingsEndpointsModel
    & AppDataContextAuthCheckEndpointsModel;

const AppDataContext = createContext<AppDataContextModel>({} as AppDataContextModel);
const useAppData = () => useContext(AppDataContext);

function AppDataProvider (props: AppBaseProviderProps) {
    const testListData = useTestListData();
    const rtcDateTimeData = useRtcDataTimeData();
    const regulatorSettingsData = useRegulatorSettingsData();
    const authData = useAuthData();

    return (
        <AppDataContext.Provider
            value={ {
                ...testListData,
                ...rtcDateTimeData,
                ...regulatorSettingsData,
                ...authData
            } }
            { ...props }
        />
    );
}

export { AppDataProvider, useAppData };
