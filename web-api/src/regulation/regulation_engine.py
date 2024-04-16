import os
import pathlib
from datetime import datetime
from threading import Thread
from time import sleep, time

from models.regulator.enums.control_mode_model import ControlModeModel
from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.heating_circuits_model import HeatingCircuitModel, HeatingCircuitsModel
from models.regulator.regulator_settings_model import RegulatorSettingsModel


def get_heating_circuit_settings(heating_circuit_index: HeatingCircuitIndexModel) -> HeatingCircuitModel:
    app_root_path = pathlib.Path(os.path.dirname(__file__)).parent.parent
    regulator_settings_path = app_root_path.joinpath('data/settings/regulator_settings.json')

    with open(regulator_settings_path, 'r', encoding='utf-8') as file:
        json = file.read()

    regulator_settings = RegulatorSettingsModel.parse_raw(json)

    return regulator_settings.heating_circuits.items[heating_circuit_index]


def start_sensors_polling(heating_circuit_index: HeatingCircuitIndexModel) -> None:
    heating_circuit_settings = get_heating_circuit_settings(heating_circuit_index)
    regulation_parameters = heating_circuit_settings.regulator_parameters.regulation_parameters

    last_receiving_settings_time = time()

    # start polling
    while True:
        current_receiving_settings_time = time()
        if current_receiving_settings_time - last_receiving_settings_time > regulation_parameters.calculation_period * 5:
            heating_circuit_settings = get_heating_circuit_settings(heating_circuit_index)
            last_receiving_settings_time = time()

        start_time = time()
        # read temperature sensors and calculate regulator valve impact
        end_time = time()

        delta = end_time - start_time
        # TODO: measutement unit (factor) of calculation_period
        if delta < regulation_parameters.calculation_period / 10:
            sleep(regulation_parameters.calculation_period / 10 - delta)

        print(f'[{datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")}] sensors_polling step {heating_circuit_index}')


def start_regulation_polling(heating_circuit_index: HeatingCircuitIndexModel) -> None:
    while True:
        # read settings
        heating_circuit_settings = get_heating_circuit_settings(heating_circuit_index)
        # get valuable settings values
        control_mode = heating_circuit_settings.regulator_parameters.control_parameters.control_mode
        regulation_parameters = heating_circuit_settings.regulator_parameters.regulation_parameters

        # measure time of the beginning of the act on the regulator valve
        start_time = time()
        # check a control mode
        if not control_mode == ControlModeModel.OFF:
            pass  # form an act on the regulator valve

        end_time = time()

        delta = end_time - start_time

        # wait for the end of period of the act on the regulator valve
        if delta < regulation_parameters.pulse_duration_valve:
            sleep(regulation_parameters.pulse_duration_valve-delta)

        print(f'[{datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")}] regulation_polling step {heating_circuit_index}')


def run_regulation(heating_circuit_index: HeatingCircuitIndexModel) -> None:
    # start polling temperature sensors and calculation
    polling_thread = Thread(target=start_sensors_polling, args=(heating_circuit_index, ))
    polling_thread.start()

    # start regulation engine
    start_regulation_polling(heating_circuit_index)
