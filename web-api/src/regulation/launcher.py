import sys, os
from multiprocessing import Process, Event as ProcessEvent, Lock as ProcessLock

from flask_ex import FlaskEx
from models.app_background_process_model import AppBackgroundProcessModel
from models.regulator.enums.control_mode_model import ControlModeModel
from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.enums.heating_circuit_type_model import HeatingCircuitTypeModel
from regulation.engine import regulation_engine_starter
from regulation.emu_engine import regulation_engine_starter as emu_regulation_engine_starter

hardware_process_lock = ProcessLock()


def launch_regulation_engines(app: FlaskEx):
    regulator_settings = app.get_regulator_settings()
    heating_circuits = regulator_settings.heating_circuits.items

    starter = regulation_engine_starter
    if os.environ.get("EMUL") == "1":
        starter = emu_regulation_engine_starter
        heating_circuits = [heating_circuit for heating_circuit in heating_circuits if heating_circuit.type == HeatingCircuitTypeModel.HEATING]

    for index, item in enumerate(heating_circuits):

        if item.regulator_parameters.control_parameters.control_mode == ControlModeModel.OFF:
            continue

        process_cancellation_event = ProcessEvent()

        regulation_heating_circuit_process = Process(
            target=starter,
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
