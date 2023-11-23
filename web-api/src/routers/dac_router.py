from multiprocessing import Process, Event
from typing import Optional

from flask_pydantic import validate

from app import app
from models.regulator.active_signal_model import AciveSignalGenModel, AciveSignalProcessGenModel
from omega.signal_generator import SignalGenerator
from responses.json_response import JsonResponse

active_signal_process_gen: Optional[AciveSignalProcessGenModel] = None

def signal_process_function(event: Event):
    s = SignalGenerator(event)
    s.sin(0, 100, 9.9)


@app.api_route('/dac/signal/<signal_id>', methods=['GET'])
@validate(response_by_alias=True)
def get_started_signal_gen(signal_id: int):
    # pylint: disable=global-statement
    global active_signal_process_gen

    if active_signal_process_gen is not None:
        active_signal_process_gen.process.terminate()

    event = Event()
    signal_process = Process(
        target=signal_process_function,
        args=(event, ),
        daemon=False
    )
    signal_process.start()

    active_signal_process_gen = AciveSignalProcessGenModel(
        process=signal_process,
        event=event,
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
        active_signal_process_gen.event.set()

        active_signal_process_gen = None

    return JsonResponse(
        response=active_signal_gen,
        status=200
    )
