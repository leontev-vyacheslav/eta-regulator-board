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
