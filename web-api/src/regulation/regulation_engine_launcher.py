import sys
from multiprocessing import Event, Process

from app import app
from models.app_background_process_model import AppBackgroundProcessModel
from regulation.regulation_engine import run_regulation


def launch_regulation_engine():
    regulator_settings = app.get_regulator_settings()

    for index, _ in enumerate(regulator_settings.heating_circuits.items):
        regulation_heating_circuit_process = Process(
            target=run_regulation,
            args=(index, ),
            daemon=False
        )
        regulation_heating_circuit_process.start()
        event = Event()

        app_process = AppBackgroundProcessModel(
            name=f'regulation_heating_circuit_process{index}',
            process=regulation_heating_circuit_process,
            cancellation_event=event,
            lifetime=sys.maxsize,
            data={'heating_circuit_index': index}
        )

        app.app_background_processes.append(app_process)
