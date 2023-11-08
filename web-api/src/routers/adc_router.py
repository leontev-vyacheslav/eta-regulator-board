from random import random
from flask_pydantic import validate


from app import app
from models.regulator.adc_value_model import AdcValueModel
from omega import gpio
from omega.mcp3208 import MCP3208
from responses.json_response import JsonResponse
from utils.debug_helper import is_debug


@app.api_route('/adc/<channel>', methods=['GET'])
@validate(response_by_alias=True)
def get_adc_value(channel: int):

    if not is_debug():
        gpio.adc_chip_select()
        with MCP3208() as mcp_3208:
            value = mcp_3208.read(channel=channel)
    else:
        value = random() * MCP3208.REFERENCE_VOLTAGE

    return JsonResponse(
        response=AdcValueModel(
            channel=channel,
            value=value),
        status=200
    )
