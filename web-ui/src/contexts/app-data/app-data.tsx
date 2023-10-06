import { createContext, useContext } from 'react';
import { AppBaseProviderProps } from '../../models/app-base-provider-props';
import { AppDataContextTestListEndpointsModel, useTestListData } from './use-test-list-data';
import { AppDataContextRtcDataTimeEndpointsModel, useRtcDataTimeData } from './use-rtc-datatime-data';
import { AppDataContextRegulatorSettingsEndpointsModel, useRegulatorSettingsData } from './use-regulator-settings-data';

export type AppDataContextModel = AppDataContextTestListEndpointsModel
    & AppDataContextRtcDataTimeEndpointsModel
    & AppDataContextRegulatorSettingsEndpointsModel;

const AppDataContext = createContext<AppDataContextModel>({} as AppDataContextModel);
const useAppData = () => useContext(AppDataContext);

function AppDataProvider (props: AppBaseProviderProps) {
    const testListData = useTestListData();
    const rtcDateTimeData = useRtcDataTimeData();
    const regulatorSettingsData = useRegulatorSettingsData();

    return (
        <AppDataContext.Provider
            value={ {
                ...testListData,
                ...rtcDateTimeData,
                ...regulatorSettingsData
            } }
            { ...props }
        />
    );
}

export { AppDataProvider, useAppData };
