import sys
from multiprocessing import Event as ProcessEvent, Process
from flask_ex import FlaskEx

from models.app_background_process_model import AppBackgroundProcessModel
from regulation.regulation_engine import RegulationEngine


def launch_regulation_engine(app: FlaskEx):
    regulator_settings = app.get_regulator_settings()

    for heating_circuit_index, _ in enumerate(regulator_settings.heating_circuits.items):
        process_cancellation_event = ProcessEvent()
        engine = RegulationEngine(heating_circuit_index=heating_circuit_index)

        regulation_heating_circuit_process = Process(
            target=engine.run,
            args=(process_cancellation_event, heating_circuit_index),
            daemon=False
        )
        regulation_heating_circuit_process.start()

        app_process = AppBackgroundProcessModel(
            name=f'regulation_process{heating_circuit_index}',
            process=regulation_heating_circuit_process,
            cancellation_event=process_cancellation_event,
            lifetime=sys.maxsize,
            data={'heating_circuit_index': heating_circuit_index}
        )

        app.app_background_processes.append(app_process)
