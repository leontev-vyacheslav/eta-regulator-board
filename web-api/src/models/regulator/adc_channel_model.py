from typing import Union
from models.abstracts.app_base_model import AppBaseModel
from models.regulator.enums.adc_channel_pin_model import AdcChannelPinModel
from models.regulator.enums.temperature_sensor_channel_model import TemperatureSensorChannelModel


class AdcChannelModel(AppBaseModel):
    pin: Union[AdcChannelPinModel, TemperatureSensorChannelModel]
    name: str
    description: str
