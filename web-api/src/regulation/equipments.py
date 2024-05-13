from time import sleep

from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.enums.temperature_sensor_channel_pins import TemperatureSensorChannels
from omega.ds1307 import DS1307
from utils.debugging import is_debug

from omega import gpio
from omega.mcp3208 import MCP3208
from omega.gpio import set as gpio_set, V1_PLUS, V1_MINUS, V2_PLUS, V2_MINUS

VALVE1_OPEN = V1_PLUS
VALVE1_CLOSE = V1_MINUS

VALVE2_OPEN = V2_PLUS
VALVE2_CLOSE = V2_MINUS


def get_temperature(channel: TemperatureSensorChannels, measurements: int = 5) -> float:
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


def set_valve_impact(heating_circuit_index: HeatingCircuitIndexModel, impact_sign: bool, delay: float):
    valve_open_pin = VALVE1_OPEN if heating_circuit_index == HeatingCircuitIndexModel.FIRST else VALVE2_OPEN
    valve_close_pin = VALVE1_CLOSE if heating_circuit_index == HeatingCircuitIndexModel.FIRST else VALVE2_CLOSE

    gpio_set(valve_open_pin, False)
    gpio_set(valve_close_pin, False)

    if impact_sign:
        gpio_set(valve_open_pin, True)
        sleep(delay)
        gpio_set(valve_open_pin, False)
    else:
        gpio_set(valve_close_pin, True)
        sleep(delay)
        gpio_set(valve_close_pin, False)
