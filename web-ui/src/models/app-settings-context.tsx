import { Dispatch, SetStateAction } from 'react';
import { RegulatorSettingsModel } from './regulator-settings/regulator-settings-model';
import { HeatingCircuitIndexModel } from './regulator-settings/enums/heating-circuit-type-model';

export type AppSettingsModel = {
  workDate?: Date;

  isShowFooter: boolean;
}

export type AppSettingsDataContextModel = AppSettingsModel;

export type AppSettingsContextModel = {
  appSettingsData: AppSettingsDataContextModel;

  setAppSettingsData: Dispatch<SetStateAction<AppSettingsDataContextModel>>;

  updateWorkDateAsync: () => Promise<void>;

  regulatorSettings: RegulatorSettingsModel | null;

  setRegulatorSettings: Dispatch<SetStateAction<RegulatorSettingsModel | null>>;

  refreshRegulatorSettingsAsync: () => Promise<void>;

  getHeatingCircuitName: (index: HeatingCircuitIndexModel) => string;
}
