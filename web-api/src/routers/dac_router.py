import time
from multiprocessing import Process, Event

from flask_pydantic import validate

from app import app
from models.app_background_process_model import AppBackgroundProcessModel
from models.regulator.active_signal_gen_model import ActiveSignalGenModel
from omega.signal_generator import SinSignalGenerator
from responses.json_response import JsonResponse
from utils.debug_helper import is_debug


def signal_generator_factory_method(event: Event, signal_id: int):
    if signal_id == 1:
        signal_generator = SinSignalGenerator(event)
        signal_generator.generate(0, 100, 9.9)
    else:
        pass


def dummy_signal_generator_factory_method(event: Event, signal_id: int):
    if signal_id == 1:
        while True:
            if event.is_set():
                break
    else:
        pass


@app.api_route('/dac/signal/<signal_id>', methods=['GET'])
@validate(response_by_alias=True)
def get_started_signal_gen(signal_id: int):

    active_signal_process_gen = next((p for p in app.app_background_processes if p.name == 'active_signal'), None)

    if active_signal_process_gen is not None:
        active_signal_process_gen.event.set()
        time.sleep(1)

    event = Event()
    target = dummy_signal_generator_factory_method if is_debug() else signal_generator_factory_method

    signal_process = Process(
        target=target,
        args=(event, signal_id),
        daemon=False
    )
    signal_process.start()

    active_signal_process_gen = AppBackgroundProcessModel(
        name='active_signal',
        process=signal_process,
        event=event,
        data={'signal_id': signal_id}
    )
    app.app_background_processes.append(active_signal_process_gen)

    return JsonResponse(
        response=ActiveSignalGenModel(
            pid=active_signal_process_gen.process.pid,
            signal_id=signal_id
        ),
        status=200
    )


@app.api_route('/dac/signal', methods=['GET'])
@validate(response_by_alias=True)
def get_active_signal_gen():
    active_signal_process_gen = next((p for p in app.app_background_processes if p.name == 'active_signal'), None)

    if active_signal_process_gen is not None:
        active_signal_gen = ActiveSignalGenModel(
            pid=active_signal_process_gen.process.pid,
            signal_id=active_signal_process_gen.data['signal_id']
        )
    else:
        active_signal_gen = None

    return JsonResponse(
        response=active_signal_gen,
        status=200
    )


@app.api_route('/dac/signal', methods=['DELETE'])
def delete_active_signal_gen():
    active_signal_gen = ActiveSignalGenModel(
        pid=0,
        signal_id=0
    )

    active_signal_process_gen = next((p for p in app.app_background_processes if p.name == 'active_signal'), None)

    if active_signal_process_gen is not None:
        active_signal_gen = ActiveSignalGenModel(
            pid=active_signal_process_gen.process.pid,
            signal_id=active_signal_process_gen.data['signal_id']
        )
        active_signal_process_gen.event.set()

        if is_debug():
            active_signal_process_gen.process.terminate()

        app.app_background_processes.remove(active_signal_process_gen)

    return JsonResponse(
        response=active_signal_gen,
        status=200
    )
