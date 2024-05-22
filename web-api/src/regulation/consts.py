from typing import List

from models.regulator.adc_channel_model import AdcChannelModel
from models.regulator.enums.temperature_sensor_channel_model import TemperatureSensorChannelModel


temperature_sensor_channels: List[AdcChannelModel] = [
    AdcChannelModel(
        pin=TemperatureSensorChannelModel.OUTDOOR_TEMPERATURE,
        name='outdoor_temperature',
        description='Температура наружного воздуха'
    ),
    AdcChannelModel(
        pin=TemperatureSensorChannelModel.ROOM_TEMPERATURE,
        name='room_temperature',
        description='Температура в помещении'
    ),
    AdcChannelModel(
        pin=TemperatureSensorChannelModel.SUPPLY_PIPE_TEMPERATURE_1,
        name='supply_pipe_temperature_1',
        description='Температура подачи контура №1'
    ),
    AdcChannelModel(
        pin=TemperatureSensorChannelModel.RETURN_PIPE_TEMPERATURE_1,
        name='return_pipe_temperature_1',
        description='Температура обратки контура №1'
    ),
    AdcChannelModel(
        pin=TemperatureSensorChannelModel.SUPPLY_PIPE_TEMPERATURE_2,
        name='supply_pipe_temperature_2',
        description='Температура подачи контура №2'
    ),
    AdcChannelModel(
        pin=TemperatureSensorChannelModel.RETURN_PIPE_TEMPERATURE_2,
        name='return_pipe_temperature_2',
        description='Температура обратки контура №2'
    )
]
