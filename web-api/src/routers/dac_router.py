import math
import time
from multiprocessing import Process
from typing import Optional

from flask_pydantic import validate

from app import app
from models.regulator.active_signal_model import AciveSignalGenModel, AciveSignalProcessGenModel
from omega import gpio
from omega.mcp4922 import MCP4922
from responses.json_response import JsonResponse

active_signal_process_gen: Optional[AciveSignalProcessGenModel] = None


def signal_process_function(signal_id):
    AMPLIFIER_GAIN = 3

    def _sleep(duration):
        now = time.perf_counter()
        end = now + duration
        while now < end:
            now = time.perf_counter()

    def _sin(channel: int, freq: int, amplitude: float):

        period = 1 / freq
        samples = 100
        t = 0.0
        step = 2 * math.pi / samples
        dt = (period / samples)

        #start_time = time.perf_counter()
        k = (MCP4922.FULL_RANGE // 2) * (amplitude / (MCP4922.REFERENCE_VOLTAGE * AMPLIFIER_GAIN))
        gpio.dac_chip_select()

        with MCP4922() as dac:
            while True:
                s = time.perf_counter()
                value = (math.sin(t) + 1) * k
                dac.write(channel, int(value))
                t += step

                if t > 2 * math.pi:
                    t = 0.0
                    #break
                e = time.perf_counter()
                _sleep((dt - (e - s)) / 30 )

    _sin(0, 100, 9.9)

@app.api_route('/dac/signal/<signal_id>', methods=['GET'])
@validate(response_by_alias=True)
def get_started_signal_gen(signal_id: int):
    # pylint: disable=global-statement
    global active_signal_process_gen

    if active_signal_process_gen is not None:
        active_signal_process_gen.process.terminate()

    signal_process = Process(
        target=signal_process_function,
        args=(signal_id, ),
        daemon=False
    )
    signal_process.start()

    active_signal_process_gen = AciveSignalProcessGenModel(
        process=signal_process,
        signal_id=signal_id
    )

    return JsonResponse(
        response=AciveSignalGenModel(
            pid=active_signal_process_gen.process.pid,
            signal_id=signal_id
        ),
        status=200
    )


@app.api_route('/dac/signal', methods=['GET'])
@validate(response_by_alias=True)
def get_active_signal_gen():

    if active_signal_process_gen is not None:
        active_signal_gen = AciveSignalGenModel(
            pid=active_signal_process_gen.process.pid,
            signal_id=active_signal_process_gen.signal_id
        )
    else:
        active_signal_gen = None

    return JsonResponse(
        response=active_signal_gen,
        status=200
    )


@app.api_route('/dac/signal', methods=['DELETE'])
def delete_active_signal_gen():
    # pylint: disable=global-statement
    global active_signal_process_gen

    active_signal_gen = AciveSignalGenModel(
        pid=0,
        signal_id=0
    )

    if active_signal_process_gen is not None:
        active_signal_gen = AciveSignalGenModel(
            pid=active_signal_process_gen.process.pid,
            signal_id=active_signal_process_gen.signal_id
        )
        active_signal_process_gen.process.terminate()
        active_signal_process_gen.process.kill()
        active_signal_process_gen = None

    return JsonResponse(
        response=active_signal_gen,
        status=200
    )
