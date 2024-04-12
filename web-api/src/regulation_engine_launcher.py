from multiprocessing import Process

from app import app
from regulation.regulation_engine import regulation_engine


def start_up():
    regulator_settings = app.get_regulator_settings()
    for heating_circuit in regulator_settings.heating_circuits:
        process = Process(target=regulation_engine, args=(heating_circuit,))
        process.start()
