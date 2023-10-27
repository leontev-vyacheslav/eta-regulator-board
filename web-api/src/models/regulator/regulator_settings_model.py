from datetime import datetime as datetime_type
from typing import Any
from models.abstracts.app_base_model import AppBaseModel

from models.regulator.enums.regulator_state_model import RegulatorStateModel
from models.regulator.gpio_set_model import GpioSetModel
from models.regulator.heating_circuits_model import HeatingCircuitsModel
from models.regulator.service_model import ServiceModel
from models.common.signin_model import SigninModel


class RegulatorSettingsModel(AppBaseModel):

    # Пуск
    regulator_state: RegulatorStateModel

    # Вход в систему
    signin: SigninModel

    heating_circuits: HeatingCircuitsModel

    # Ввод/вывод
    gpio_set: GpioSetModel

    # Сервис
    service: ServiceModel


class RegulatorSettingsChangeLogItemModel(AppBaseModel):
    data_field: str

    value: Any  # Union[str, bool, float, int, datetime_type]

    path: str

    datetime: datetime_type


class RegulatorSettingsChangeModel(AppBaseModel):
    regulator_settings: RegulatorSettingsModel

    change_log_item: RegulatorSettingsChangeLogItemModel
