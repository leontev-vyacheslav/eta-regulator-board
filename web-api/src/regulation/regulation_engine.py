import os
import pathlib
from time import sleep, time
from multiprocessing import Event as ProcessEvent, Lock as ProcessLock
from threading import Thread, Event as ThreadingEvent

from models.regulator.enums.control_mode_model import ControlModeModel
from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.heating_circuits_model import HeatingCircuitModel
from models.regulator.regulator_settings_model import RegulatorSettingsModel

from loggers.default_logger_builder import build as build_default_logger

process_lock_sensor_reading = ProcessLock()

class RegulationEngine:

    sensors_polling_started = 'The sensors polling thread %d was STARTED.'
    sensors_polling_done = 'The sensors polling thread %d has DONE A STEP.'
    sensors_polling_stopped = 'The sensors polling thread %d was gracefully STOPPED.'

    regulation_polling_started = 'The regulation polling process %d was STARTED.'
    regulation_polling_done = 'The regulation polling process %d has DONE A STEP.'
    regulation_polling_stopped = 'The regulation polling process %d was gracefully STOPPED.'

    def __init__(self, heating_circuit_index: HeatingCircuitIndexModel) -> None:
        self.logger = build_default_logger(f'regulation_engine_logger_{heating_circuit_index}')

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
        self.logger.info(RegulationEngine.sensors_polling_started, heating_circuit_index)

        while True:
            if threading_cancellation_event.is_set():
                self.logger.info(RegulationEngine.sensors_polling_stopped, heating_circuit_index)
                break

            current_receiving_settings_time = time()
            if current_receiving_settings_time - last_receiving_settings_time > regulation_parameters.calculation_period * 5:
                heating_circuit_settings = self._get_heating_circuit_settings(heating_circuit_index)
                last_receiving_settings_time = time()

            process_lock_sensor_reading.acquire()
            try:
                start_time = time()
                # read temperature sensors and calculate regulator valve impact
                end_time = time()
            finally:
                process_lock_sensor_reading.release()

            delta = end_time - start_time
            # TODO: measutement unit (factor) of calculation_period
            if delta < regulation_parameters.calculation_period / 10:
                sleep(regulation_parameters.calculation_period / 10 - delta)

            self.logger.info(RegulationEngine.sensors_polling_done, heating_circuit_index)

    def run(self, process_cancellation_event: ProcessEvent, heating_circuit_index: HeatingCircuitIndexModel) -> None:
        self.logger.info(RegulationEngine.regulation_polling_started, heating_circuit_index)

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

                self.logger.info(RegulationEngine.regulation_polling_stopped, heating_circuit_index)

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

            self.logger.info(RegulationEngine.regulation_polling_done, heating_circuit_index)
