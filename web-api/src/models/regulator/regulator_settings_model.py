from datetime import datetime as datetime_type
from typing import Any
from models.abstracts.app_base_model import AppBaseModel

from models.regulator.enums.regulator_state_model import RegulatorStateModel
from models.regulator.gpio_set_model import GpioSetModel
from models.regulator.heating_circuits_model import HeatingCircuitsModel
from models.regulator.service_model import ServiceModel


class RegulatorSettingsModel(AppBaseModel):

    regulator_state: RegulatorStateModel

    heating_circuits: HeatingCircuitsModel

    gpio_set: GpioSetModel

    service: ServiceModel


class RegulatorSettingsChangeLogItemModel(AppBaseModel):
    data_field: str

    value: Any  # Union[str, bool, float, int, datetime_type]

    path: str

    datetime: datetime_type


class RegulatorSettingsChangeModel(AppBaseModel):
    regulator_settings: RegulatorSettingsModel

    change_log_item: RegulatorSettingsChangeLogItemModel
