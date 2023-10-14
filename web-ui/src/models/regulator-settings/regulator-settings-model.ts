import { SigninModel } from '../data/signin-model'
import { RegulatorParametersModel as RegulatorParametersModel } from './regulator-parameters-model'
import { RegulatorStateModel } from './enums/regulator-state-model'
import { GpioSetModel } from './gpio-set-model'
import { RegulatorOwnerModel } from './regulator-owner-model'
import { ServiceModel } from './service-model'


export type RegulatorSettingsModel = {

    regulatorState: RegulatorStateModel,

    signIn: SigninModel,

    regulatorOwner: RegulatorOwnerModel,

    regulatorParameters: RegulatorParametersModel,

    gpioSet: GpioSetModel

    service: ServiceModel,
}