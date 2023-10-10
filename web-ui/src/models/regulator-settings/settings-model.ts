import { SigninModel } from '../data/signin-model'
import { ControlParametersModel } from './control-parameters-model'
import { RegulatorStateModel } from './enums/regulator-state-model'
import { GpioSetModel } from './gpio-set-model'
import { RegulatorOwnerModel } from './regulator-owner-model'
import { ServiceModel } from './service-model'


export type RegulatorSettings = {
    mhenoschemeName: string,

    regulatorState: RegulatorStateModel,

    signIn: SigninModel,

    regulatorOwner: RegulatorOwnerModel,

    controlParameters: ControlParametersModel,

    service: ServiceModel,

    gpioSet: GpioSetModel
}