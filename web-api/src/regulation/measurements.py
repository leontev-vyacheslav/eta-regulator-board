
from typing import List
from models.regulator.adc_channel_model import AdcChannelModel
from models.regulator.enums.temperature_sensor_channel_pins import TemperatureSersorChannelPins
from omega.ds1307 import DS1307
from utils.debugging import is_debug

from omega import gpio
from omega.mcp3208 import MCP3208


temperature_sersor_channels: List[AdcChannelModel] = [
    AdcChannelModel(
        pin=TemperatureSersorChannelPins.OUTDOOR_TEMPERATURE,
        name='outdoor_temperature',
        description='Температура наружного воздуха'
    ),
    AdcChannelModel(
        pin=TemperatureSersorChannelPins.ROOM_TEMPERATURE,
        name='room_temperature',
        description='Температура в помещении'
    ),
    AdcChannelModel(
        pin=TemperatureSersorChannelPins.SUPPLY_PIPE_TEMPERATURE_1,
        name='supply_pipe_temperature_1',
        description='Температура подачи контура №1'
    ),
    AdcChannelModel(
        pin=TemperatureSersorChannelPins.RETURN_PIPE_TEMPERATURE_1,
        name='return_pipe_temperature_1',
        description='Температура обратки контура №1'
    ),
    AdcChannelModel(
        pin=TemperatureSersorChannelPins.SUPPLY_PIPE_TEMPERATURE_2,
        name='supply_pipe_temperature_2',
        description='Температура подачи контура №2'
    ),
    AdcChannelModel(
        pin=TemperatureSersorChannelPins.RETURN_PIPE_TEMPERATURE_2,
        name='return_pipe_temperature_2',
        description='Температура обратки контура №2'
    )
]


def get_temperature(channel: TemperatureSersorChannelPins, measurements: int = 5) -> float:
    if is_debug():
        return 0

    gpio.adc_chip_select()
    try:
        gpio.set(gpio.GPIO_Vp, False)
        with MCP3208() as mcp_3208:
            value = mcp_3208.read_avg(channel=int(channel), measurements=measurements)
    finally:
        gpio.set(gpio.GPIO_Vp, True)

    # TODO: divide by zero
    temperature = (973 * 3.3 / value - 973 - 1000) / 3.9

    return temperature


def get_rtc_datetime():
    with DS1307() as rtc:
        rtc_now = rtc.read_datetime()

    return rtc_now