from random import random

from flask_pydantic import validate

from app import app
from models.regulator.adc_value_model import AdcValueModel, TemperatureValueModel
from omega import gpio
from omega.mcp3208 import MCP3208
from responses.json_response import JsonResponse
from utils.debugging import is_debug
from lockers import hardware_process_lock

from omega.decoders import adc_value_to_temperature


@app.api_route('/adc/<channel>', methods=['GET'])
@validate(response_by_alias=True)
def get_adc_value(channel: int):
    if not is_debug():
        with hardware_process_lock:
            gpio.adc_chip_select()
            with MCP3208() as mcp_3208:
                value = mcp_3208.read_avg(channel=channel, measurements=1)
    else:
        value = random() * MCP3208.REFERENCE_VOLTAGE

    return JsonResponse(
        response=AdcValueModel(
            channel=channel,
            value=value),
    )


@app.api_route('/temperature/<channel>', methods=['GET'])
@validate(response_by_alias=True)
def get_temperature_value(channel: int):
    if not is_debug():
        with hardware_process_lock:
            gpio.adc_chip_select()
            try:
                gpio.set(gpio.GPIO_Vp, False)
                with MCP3208() as mcp_3208:
                    value = mcp_3208.read_avg(channel=channel, measurements=5)
            finally:
                gpio.set(gpio.GPIO_Vp, True)
    else:
        value = random() * MCP3208.REFERENCE_VOLTAGE
    try:
        temperature = adc_value_to_temperature(value)
    except ZeroDivisionError:
        temperature = float("inf")

    return JsonResponse(
        response=TemperatureValueModel(
            channel=channel,
            value=temperature),
    )
