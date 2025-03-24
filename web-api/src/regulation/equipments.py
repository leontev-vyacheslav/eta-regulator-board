from time import sleep
from datetime import datetime, timezone
from typing import List
from lockers import hardware_process_lock, hardware_process_rtc_lock

from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.enums.temperature_sensor_channel_model import TemperatureSensorChannelModel
from omega.ds1307 import DS1307
from omega.mcp4922 import MCP4922
from utils.debugging import is_debug

from omega import gpio
from omega.mcp3208 import MCP3208
from omega.gpio import V1_PLUS, V1_MINUS, V2_PLUS, V2_MINUS

from omega.decoders import adc_value_to_temperature

VALVE1_OPEN = V1_PLUS
VALVE1_CLOSE = V1_MINUS

VALVE2_OPEN = V2_PLUS
VALVE2_CLOSE = V2_MINUS


def get_temperatures(channels: List[TemperatureSensorChannelModel], measurements: int = 10) -> List[float]:
    if is_debug():
        return [0.0 for _ in channels]

    results: List[float] = []

    with hardware_process_lock:
        gpio.adc_chip_select()

        try:
            gpio.set(gpio.GPIO_Vp, False)
            with MCP3208() as mcp_3208:
                for channel in channels:
                    try:
                        sleep(0.01)
                        value = mcp_3208.read_avg(channel=channel.value, measurements=measurements)
                    except Exception:
                        results.append(float("inf"))
                        continue

                    try:
                        temperature = adc_value_to_temperature(value)

                        if abs(temperature) > 125:
                            temperature = float("inf")

                        results.append(temperature)
                    except ZeroDivisionError:
                        results.append(float("inf"))
        finally:
            gpio.set(gpio.GPIO_Vp, True)

    return results


def get_temperature(channel: TemperatureSensorChannelModel, measurements: int = 10) -> float:
    if is_debug():
        return 0

    with hardware_process_lock:
        gpio.adc_chip_select()
        try:
            gpio.set(gpio.GPIO_Vp, False)
            sleep(0.1)
            with MCP3208() as mcp_3208:
                value = mcp_3208.read_avg(channel=channel.value, measurements=measurements)
        except Exception:
            return float("inf")
        finally:
            gpio.set(gpio.GPIO_Vp, True)

        try:
            temperature = adc_value_to_temperature(value)
        except ZeroDivisionError:
            return float("inf")

        if abs(temperature) > 125:
            return float("inf")

    return temperature


def get_rtc_datetime() -> datetime:
    if is_debug():
        return datetime.utcnow().replace(tzinfo=timezone.utc)

    with hardware_process_rtc_lock:
        with DS1307() as rtc:
            rtc_now = rtc.read_datetime()

    return rtc_now


def set_valve_impact(heating_circuit_index: HeatingCircuitIndexModel, impact_sign: bool, impact_duration: float):
    valve_open_pin = VALVE1_OPEN if heating_circuit_index == HeatingCircuitIndexModel.FIRST else VALVE2_OPEN
    valve_close_pin = VALVE1_CLOSE if heating_circuit_index == HeatingCircuitIndexModel.FIRST else VALVE2_CLOSE

    if is_debug():
        sleep(0.5)
        return

    with hardware_process_lock:
        gpio.set(valve_open_pin, False)
        gpio.set(valve_close_pin, False)

    if impact_sign:
        with hardware_process_lock:
            gpio.set(valve_open_pin, True)

        sleep(impact_duration)

        with hardware_process_lock:
            gpio.set(valve_open_pin, False)
    else:
        with hardware_process_lock:
            gpio.set(valve_close_pin, True)

        sleep(impact_duration)

        with hardware_process_lock:
            gpio.set(valve_close_pin, False)


def close_valve(heating_circuit_index: HeatingCircuitIndexModel):
    valve_open_pin = VALVE1_OPEN if heating_circuit_index == HeatingCircuitIndexModel.FIRST else VALVE2_OPEN
    valve_close_pin = VALVE1_CLOSE if heating_circuit_index == HeatingCircuitIndexModel.FIRST else VALVE2_CLOSE

    if is_debug():
        sleep(0.1)
        return

    with hardware_process_lock:
        gpio.set(valve_open_pin, False)
        gpio.set(valve_close_pin, False)

    sleep(0.1)

    with hardware_process_lock:
        gpio.set(valve_close_pin, True)


def open_valve(heating_circuit_index: HeatingCircuitIndexModel):
    valve_open_pin = VALVE1_OPEN if heating_circuit_index == HeatingCircuitIndexModel.FIRST else VALVE2_OPEN
    valve_close_pin = VALVE1_CLOSE if heating_circuit_index == HeatingCircuitIndexModel.FIRST else VALVE2_CLOSE

    if is_debug():
        sleep(0.1)
        return

    with hardware_process_lock:
        gpio.set(valve_open_pin, False)
        gpio.set(valve_close_pin, False)

    sleep(0.1)

    with hardware_process_lock:
        gpio.set(valve_open_pin, True)


def set_analog_valve_impact(heating_circuit_index: HeatingCircuitIndexModel, impact: float):
    channel = heating_circuit_index
    value = (impact / 100) * MCP4922.FULL_RANGE

    with hardware_process_lock:
        gpio.dac_chip_select()
        with MCP4922() as dac:
            dac.write(channel, int(value))
