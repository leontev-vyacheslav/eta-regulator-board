from typing import Union
from models.abstracts.app_base_model import AppBaseModel
from models.regulator.enums.adc_channel_pins import AdcChannelPins
from models.regulator.enums.temperature_sensor_channel_pins import TemperatureSersorChannelPins


class AdcChannelModel(AppBaseModel):
    pin: Union[AdcChannelPins, TemperatureSersorChannelPins]
    name: str
    description: str
