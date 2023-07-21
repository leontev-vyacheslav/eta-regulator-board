import { useCallback, useMemo } from 'react';
import { TestModel } from '../../models/data/test-model';
import { useAuthHttpRequest } from './use-auth-http-request';

export type AppDataContextTestEndpointsModel = {
  getTestListAsync: () => Promise<TestModel[]>;
}

export const useTestData = () => {
  const authHttpRequest = useAuthHttpRequest();

  const baseRoute = useMemo<string>(() => {
    return '/tests';
  }, []);

  const getTestListAsync = useCallback(async () => {
    const response = await authHttpRequest({
      url: `${baseRoute}`,
      method: 'GET',
    });

    return response ? response.data as TestModel[] : null;
  }, [authHttpRequest, baseRoute]);

  return {
    getTestListAsync
  };
};