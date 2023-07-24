import { Dispatch, SetStateAction } from 'react';
import { ProcFunc } from './primitive-type';

export type AppSettingsModel = {
  workDate: Date,

  isShowFooter: boolean,
}

export type AppSettingsDataContextModel = AppSettingsModel;

export type AppSettingsContextModel = {
  appSettingsData: AppSettingsDataContextModel,
  setAppSettingsData: Dispatch<SetStateAction<AppSettingsDataContextModel>>,
  setWorkDateToday: ProcFunc
}
