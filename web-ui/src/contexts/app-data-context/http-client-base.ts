import axios from 'axios';
import { AppConstants } from '../../constants/app-constants';
import { handleDates } from '../../utils/date-convertor';

const httpClientBase = axios.create({
  baseURL: AppConstants.webApiRoot,
});

httpClientBase.interceptors.response.use((originalResponse) => {
  handleDates(originalResponse.data);

  return originalResponse;
});

export { httpClientBase };