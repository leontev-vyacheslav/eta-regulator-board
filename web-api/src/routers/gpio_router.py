from flask_pydantic import validate
from flask import Response

from app import app
from omega import gpio
from responses.json_response import JsonResponse


@app.api_route('/gpio/<pin>/<state>', methods=['PUT'])
@validate(response_by_alias=True)
def put_gpio(pin: int, state: bool):
    try:
        value = gpio.set(pin, state)

        return JsonResponse(
            response={'value': value},
            status=200
        )
    except:
        return Response(status=500)


@app.api_route('/gpio/<pin>', methods=['GET'])
@validate(response_by_alias=True)
def get_gpio(pin: int):
    try:
        value = gpio.get(pin)

        return JsonResponse(
            response={'value': value},
            status=200
        )
    except:
        return Response(status=500)
