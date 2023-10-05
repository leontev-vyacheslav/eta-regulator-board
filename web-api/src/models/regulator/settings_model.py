from models.abstracts.app_base_model import AppBaseModel

from models.regulator.control_parameters_model import ControlParametersModel
from models.regulator.enums.regulator_state_model import RegulatorStateModel
from models.regulator.regulator_owner_model import RegulatorOwnerModel
from models.regulator.service_model import ServiceModel
from models.regulator.signin_model import SignInModel


class SettingsModel(AppBaseModel):
    mhenoscheme_name: str

    regulator_state: RegulatorStateModel

    signin: SignInModel

    regulator_owner: RegulatorOwnerModel

    control_parameters: ControlParametersModel

    service: ServiceModel
