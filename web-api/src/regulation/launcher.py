import sys
import os
from multiprocessing import Process, Event as ProcessEvent, Lock as ProcessLock
from typing import Callable, Optional

from flask_ex import FlaskEx
from models.common.app_background_process_model import AppBackgroundProcessModel
from models.regulator.enums.control_mode_model import ControlModeModel
from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.heating_circuits_model import HeatingCircuitModel

from regulation.engine import regulation_engine_starter as default_regulation_engine_starter

hardware_process_lock = ProcessLock()


def launch_regulation_engines(app: FlaskEx, target_heating_circuit_index: Optional[HeatingCircuitIndexModel] = None):
    regulator_settings = app.get_regulator_settings()
    heating_circuits = regulator_settings.heating_circuits.items
    regulation_engine_starter: Optional[Callable] = None

    def launch(index: int, item: HeatingCircuitModel):
        if item.control_parameters.control_mode == ControlModeModel.OFF:
            return

        process_cancellation_event = ProcessEvent()

        regulation_heating_circuit_process = Process(
            target=regulation_engine_starter,
            args=(HeatingCircuitIndexModel(index), process_cancellation_event, hardware_process_lock),
            daemon=False
        )
        regulation_heating_circuit_process.start()

        app_process = AppBackgroundProcessModel(
            name=f'regulation_process_{index}_{item.type.name}',
            process=regulation_heating_circuit_process,
            cancellation_event=process_cancellation_event,
            lifetime=sys.maxsize,
            data={'heating_circuit_index': index}
        )

        app.app_background_processes.append(app_process)

    regulation_engine_starter_name = os.environ.get('REGULATOR_ENGINE_STARTER')
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
            launch(index, item)
    else:
        target_heating_circuit = next((
            heating_circuit
            for index, heating_circuit in enumerate(heating_circuits)
            if index == target_heating_circuit_index
        ), None)
        if target_heating_circuit is not None:
            launch(target_heating_circuit_index.value, target_heating_circuit)
