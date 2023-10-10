import { useCallback } from 'react';
import { TestModel } from '../../models/data/test-model';
import { HttpConstants } from '../../constants/app-http-constants';
import { Method } from 'axios';
import { TestListModel } from '../../models/data/test-list-model';
import { useAuthHttpRequest } from './use-auth-http-request';
import routes from '../../constants/app-api-routes';

export type GetTestListDataAsyncFunc = () => Promise<TestListModel | null>;
export type PostTestDataAsyncFunc = (testModel: TestModel) => Promise<TestModel | null>;
export type PutTestDataAsyncFunc = (testModel: TestModel) => Promise<TestModel | null>;
export type DeleteTestDataAsyncFunc = (testId: number) => Promise<TestModel | null>;

export type AppDataContextTestListEndpointsModel = {
    getTestListDataAsync: GetTestListDataAsyncFunc;

    postTestDataAsync: PostTestDataAsyncFunc;

    putTestDataAsync: PutTestDataAsyncFunc;

    deleteTestDataAsync: DeleteTestDataAsyncFunc;
}

export const useTestListData = () => {

    const authHttpRequest = useAuthHttpRequest();

    const getTestListDataAsync = useCallback<GetTestListDataAsyncFunc>(async (): Promise<TestListModel | null> => {
        const response = await authHttpRequest({
            url: `${routes.host}${routes.tests}`,
            method: HttpConstants.Methods.Get as Method,
            data: {}
        });

        if (response && response.status === HttpConstants.StatusCodes.Ok) {

            return response.data as TestListModel;
        }

        return null;
    }, [authHttpRequest]);

    const deleteTestDataAsync = useCallback<DeleteTestDataAsyncFunc>(async (testId: number): Promise<TestModel | null> => {
        const response = await authHttpRequest({
            url: `${routes.host}${routes.tests}/${testId}`,
            method: HttpConstants.Methods.Delete as Method,
        },);

        if (response && response.status === HttpConstants.StatusCodes.Ok) {

            return response.data as TestModel;
        }

        return null;
    }, [authHttpRequest]);

    const postTestDataAsync = useCallback<PostTestDataAsyncFunc>(async (testModel: TestModel): Promise<TestModel | null> => {
        const response = await authHttpRequest({
            url: `${routes.host}${routes.tests}`,
            method: HttpConstants.Methods.Post as Method,
            data: testModel
        });

        if (response && response.status === HttpConstants.StatusCodes.Ok) {

            return response.data as TestModel;
        }

        return null;
    }, [authHttpRequest]);

    const putTestDataAsync = useCallback<PutTestDataAsyncFunc>(async (testModel: TestModel): Promise<TestModel | null> => {
        const response = await authHttpRequest({
            url: `${routes.host}${routes.tests}`,
            method: HttpConstants.Methods.Put as Method,
            data: testModel
        });

        if (response && response.status === HttpConstants.StatusCodes.Ok) {

            return response.data as TestModel;
        }

        return null;
    }, [authHttpRequest]);


    return {
        getTestListDataAsync,
        postTestDataAsync,
        putTestDataAsync,
        deleteTestDataAsync,
    };
}