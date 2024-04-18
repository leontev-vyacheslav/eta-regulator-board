import os
import sys
import pathlib
import logging
from datetime import datetime
from time import sleep, time
from multiprocessing import Event as ProcessEvent
from threading import Thread, Event as ThreadingEvent

from models.regulator.enums.control_mode_model import ControlModeModel
from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.heating_circuits_model import HeatingCircuitModel
from models.regulator.regulator_settings_model import RegulatorSettingsModel


class RegulationEngineLoggingFormatter(logging.Formatter):
    def format(self, record):
        record.pid = os.getpid()
        record.created_utc = datetime.utcfromtimestamp(record.created)
        record.utctime = record.created_utc.strftime("%Y-%m-%d %H:%M:%S.%f%z")[:-4] + " +0000"

        return super().format(record)


class RegulationEngine:

    sensors_polling_stopped = 'The sensors polling thread %d was gracefully stopped.'
    sensors_polling_done = 'The sensors polling thread %d has done a step.'
    regulation_polling_stopped ='The regulation polling process %d was gracefully stopped.'
    regulation_polling_done ='The regulation polling process %d has done a step.'

    def __init__(self) -> None:
        self.logger = logging.getLogger()
        self.logger.setLevel(logging.DEBUG)

        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.DEBUG)
        handler.setFormatter(
            RegulationEngineLoggingFormatter('[%(utctime)s] [%(pid)d] [%(levelname)s] %(message)s')
        )

        self.logger.addHandler(handler)

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
                self.logger.info(RegulationEngine.sensors_polling_stopped, heating_circuit_index)
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

            self.logger.info(RegulationEngine.sensors_polling_done, heating_circuit_index)

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
