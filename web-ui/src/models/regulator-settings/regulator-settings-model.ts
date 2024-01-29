import { RegulatorStateModel } from './enums/regulator-state-model'
import { GpioSetModel } from './gpio-set-model'
import { ServiceModel } from './service-model'
import { HeatingCircuitsModel } from './heating-circuits-model'


export type RegulatorSettingsModel = {

    regulatorState: RegulatorStateModel;

    heatingCircuits: HeatingCircuitsModel;

    gpioSet: GpioSetModel;

    service: ServiceModel;
}