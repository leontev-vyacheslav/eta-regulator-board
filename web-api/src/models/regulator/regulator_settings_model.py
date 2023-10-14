from models.abstracts.app_base_model import AppBaseModel
from models.regulator.regulator_parameters_model import RegulatorParametersModel
from models.regulator.enums.regulator_state_model import RegulatorStateModel
from models.regulator.gpio_set_model import GpioSetModel
from models.regulator.service_model import ServiceModel
from models.common.signin_model import SigninModel


class RegulatorSettingsModel(AppBaseModel):

    # Пуск
    regulator_state: RegulatorStateModel

    # Вход в систему
    signin: SigninModel

    # Параметры
    regulator_parameters: RegulatorParametersModel

    # Ввод/вывод
    gpio_set: GpioSetModel

    # Сервис
    service: ServiceModel
