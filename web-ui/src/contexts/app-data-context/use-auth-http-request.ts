import { useCallback } from 'react';
import { AxiosError, AxiosRequestConfig, AxiosResponse, RawAxiosRequestHeaders } from 'axios';
import { HttpConstants } from '../../constants/http-constants';
import { httpClientBase } from './http-client-base';

type AxiosWithCredentialsFunc = (config: AxiosRequestConfig, suppressLoader?: boolean) => Promise<AxiosResponse | null | undefined>;

export const useAuthHttpRequest = (): AxiosWithCredentialsFunc => {

  const authHttpRequest = useCallback<AxiosWithCredentialsFunc>(async (config: AxiosRequestConfig<any>, suppressLoader: boolean = false) => {
    let response: AxiosResponse<any, any> | null | undefined = null;
    config = config || {};
    config.headers = config.headers || {};
    config.headers = { ...config.headers, ...HttpConstants.Headers.AcceptJson } as RawAxiosRequestHeaders;

    try {
      if (!suppressLoader) {
        // setIsShowLoadPanel(true);
      }

      response = await httpClientBase.request(config) as AxiosResponse;
    } catch (error) {
      const errorResponse = (error as AxiosError).response;

        console.error(errorResponse);

      response = null;
    } finally {
      if (!suppressLoader) {
        setTimeout(() => {
          // setIsShowLoadPanel(false);
        }, 500);
      }
    }

    return response ? response.data : null;
  }, []);

  return authHttpRequest;
};
