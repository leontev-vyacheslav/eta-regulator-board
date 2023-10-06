import { ControlParametersModel } from './control-parameters-model'
import { RegulatorStateModel } from './enums/regulator-state-model'
import { RegulatorOwnerModel } from './regulator-owner-model'
import { ServiceModel } from './service-model'
import { SignInModel } from './sign-in-model'

export type RegulatorSettings = {
    mhenoschemeName: string,

    regulatorState: RegulatorStateModel,

    signIn: SignInModel,

    regulatorOwner: RegulatorOwnerModel,

    controlParameters: ControlParametersModel,

    service: ServiceModel
}