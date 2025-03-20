import random
import os
from multiprocessing import Process, Event as ProcessEvent
import time
from typing import Callable, Optional

from flask_ex import FlaskEx
from lockers import hardware_process_lock
from models.common.app_background_process_model import AppBackgroundProcessModel
from models.regulator.enums.control_mode_model import ControlModeModel
from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.heating_circuits_model import HeatingCircuitModel
from regulation.engine import regulation_engine_starter as default_regulation_engine_starter
from utils.debugging import is_debug


def launch_regulation_engines(app: FlaskEx, target_heating_circuit_index: Optional[HeatingCircuitIndexModel] = None):
    regulator_settings = app.get_regulator_settings()
    heating_circuits = regulator_settings.heating_circuits.items
    regulation_engine_starter: Optional[Callable] = None

    def __launch(index: int, item: HeatingCircuitModel):

        if item.control_parameters.control_mode == ControlModeModel.OFF:
            return

        reguration_process_name = f'regulation_process_{index}_{item.type.name}'

        delay = random.random() + 1
        start_time_waiting = time.time()
        app.app_logger.info(f'Waiting before starting \'{reguration_process_name}\' for {delay:.2f} sec...')
        while time.time() - start_time_waiting < delay:
            time.sleep(0.01)

        process_cancellation_event = ProcessEvent()

        regulation_heating_circuit_process = Process(
            name=reguration_process_name,
            target=regulation_engine_starter,
            args=(HeatingCircuitIndexModel(index), process_cancellation_event, hardware_process_lock),
            daemon=False
        )
        regulation_heating_circuit_process.start()

        env_lifetime = os.environ.get('REGULATION_ENGINE_LIFETIME')
        lifetime = 300 if is_debug() else 10800 # from 5min to 3hour

        if env_lifetime and str(env_lifetime).isalnum():
            lifetime = int(env_lifetime)

        app_process = AppBackgroundProcessModel(
            name=reguration_process_name,
            process=regulation_heating_circuit_process,
            cancellation_event=process_cancellation_event,
            lifetime=lifetime + random.randint(1, 5),
            data={'heating_circuit_index': index},
            relauncher=lambda: launch_regulation_engines(app, target_heating_circuit_index=(HeatingCircuitIndexModel(index)))
        )

        app.app_background_processes.append(app_process)

        app.app_logger.info(f'The process \'{reguration_process_name}\' was launched with PID {regulation_heating_circuit_process.pid} and lifetime {lifetime} sec.')

    regulation_engine_starter_name = os.environ.get('REGULATION_ENGINE_STARTER')
    if regulation_engine_starter_name is None:
        regulation_engine_starter = globals().get('default_regulation_engine_starter')
    else:
        regulation_engine_starter = globals().get(regulation_engine_starter_name)
        if regulation_engine_starter is None:
            regulation_engine_starter = default_regulation_engine_starter

    if target_heating_circuit_index is None:
        heating_circuits = [
            heating_circuit
            for heating_circuit in heating_circuits
            if heating_circuit.type in regulation_engine_starter.heating_circuit_types
        ]
        for index, item in enumerate(heating_circuits):
            __launch(index, item)
    else:
        target_heating_circuit = next((
            heating_circuit
            for index, heating_circuit in enumerate(heating_circuits)
            if index == target_heating_circuit_index.value
        ), None)

        if target_heating_circuit is not None:
            __launch(target_heating_circuit_index.value, target_heating_circuit)
