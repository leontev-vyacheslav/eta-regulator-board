import { createContext, useContext } from 'react';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { AppBaseProviderProps } from '../../models/app-base-provider-props';
import { TestListModel } from '../../models/data/test-list-model';
import { TestModel } from '../../models/data/test-model';
import { RtcDateTimeModel } from '../../models/data/rtc-datetime-model';
import { AppDataContextTestListEndpointsModel, useTestListData } from './use-test-list-data';
import { AppDataContextRtcDataTimeEndpointsModel, useRtcDataTimeData } from './use-rtc-datatime-data';


export type AxiosWithCredentialsFunc = (config: AxiosRequestConfig) => Promise<AxiosResponse | undefined>;

export type GetTestListDataAsyncFunc = () => Promise<TestListModel | null>;
export type PostTestDataAsyncFunc = (testModel: TestModel) => Promise<TestModel | null>;
export type PutTestDataAsyncFunc = (testModel: TestModel) => Promise<TestModel | null>;
export type DeleteTestDataAsyncFunc = (testId: number) => Promise<TestModel | null>;

export type GetRtcDatetimeAsyncFunc = () => Promise<RtcDateTimeModel | null>;

export type AppDataContextModel = AppDataContextTestListEndpointsModel
    & AppDataContextRtcDataTimeEndpointsModel;

const AppDataContext = createContext<AppDataContextModel>({} as AppDataContextModel);
const useAppData = () => useContext(AppDataContext);

function AppDataProvider (props: AppBaseProviderProps) {
    const testListData = useTestListData();
    const rtcDateTimeData = useRtcDataTimeData();

    return (
        <AppDataContext.Provider
            value={ {
                ...testListData,
                ...rtcDateTimeData
            } }
            { ...props }
        />
    );
}

export { AppDataProvider, useAppData };
