import os
import pathlib
from datetime import datetime
from time import sleep, time
from multiprocessing import Event as ProcessEvent
from threading import Thread, Event as ThreadingEvent

from models.regulator.enums.control_mode_model import ControlModeModel
from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.heating_circuits_model import HeatingCircuitModel
from models.regulator.regulator_settings_model import RegulatorSettingsModel


class RegulationEngine:

    def _get_heating_circuit_settings(self, heating_circuit_index: HeatingCircuitIndexModel) -> HeatingCircuitModel:
        app_root_path = pathlib.Path(os.path.dirname(__file__)).parent.parent
        regulator_settings_path = app_root_path.joinpath('data/settings/regulator_settings.json')

        with open(regulator_settings_path, 'r', encoding='utf-8') as file:
            json = file.read()

        regulator_settings = RegulatorSettingsModel.parse_raw(json)

        return regulator_settings.heating_circuits.items[heating_circuit_index]

    def _run_sensors_polling(self, threading_cancellation_event: ThreadingEvent, heating_circuit_index: HeatingCircuitIndexModel) -> None:
        heating_circuit_settings = self._get_heating_circuit_settings(heating_circuit_index)
        regulation_parameters = heating_circuit_settings.regulator_parameters.regulation_parameters

        last_receiving_settings_time = time()

        # start polling
        while True:
            if threading_cancellation_event.is_set():
                print(
                    f'[{datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")}] The sensors polling thread {heating_circuit_index} was gracefully stopped.')
                break

            current_receiving_settings_time = time()
            if current_receiving_settings_time - last_receiving_settings_time > regulation_parameters.calculation_period * 5:
                heating_circuit_settings = self._get_heating_circuit_settings(heating_circuit_index)
                last_receiving_settings_time = time()

            start_time = time()
            # read temperature sensors and calculate regulator valve impact
            end_time = time()

            delta = end_time - start_time
            # TODO: measutement unit (factor) of calculation_period
            if delta < regulation_parameters.calculation_period / 10:
                sleep(regulation_parameters.calculation_period / 10 - delta)

            print(f'[{datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")}] The sensors polling thread {heating_circuit_index} has done a step.')

    def run(self, process_cancellation_event: ProcessEvent, heating_circuit_index: HeatingCircuitIndexModel) -> None:
        # start polling temperature sensors and calculation
        threading_cancellation_event = ThreadingEvent()
        polling_thread = Thread(target=self._run_sensors_polling, args=(
            threading_cancellation_event, heating_circuit_index))
        polling_thread.start()

        while True:
            if process_cancellation_event.is_set():
                threading_cancellation_event.set()
                while polling_thread.is_alive():
                    pass

                print(f'[{datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")}] The regulation polling process {heating_circuit_index} was gracefully stopped.')

                break

            # read settings
            heating_circuit_settings = self._get_heating_circuit_settings(heating_circuit_index)
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

            print(f'[{datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")}] The regulation polling process {heating_circuit_index} has done a step.')
