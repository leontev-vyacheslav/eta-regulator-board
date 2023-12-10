import { SigninModel } from '../data/signin-model'
import { RegulatorStateModel } from './enums/regulator-state-model'
import { GpioSetModel } from './gpio-set-model'
import { ServiceModel } from './service-model'
import { HeatingCircuitsModel } from './heating-circuits-model'


export type RegulatorSettingsModel = {

    regulatorState: RegulatorStateModel;

    signIn: SigninModel;

    heatingCircuits: HeatingCircuitsModel;

    gpioSet: GpioSetModel;

    service: ServiceModel;
}

export type RegulatorSettingsChangeLogItemModel = {
    dataField: string;

    value: string | boolean | number | Date;

    path: string;

    datetime: Date;
}

export type RegulatorSettingsChangeModel = {
    regulatorSettings: RegulatorSettingsModel;

    changeLogItem: RegulatorSettingsChangeLogItemModel;
}