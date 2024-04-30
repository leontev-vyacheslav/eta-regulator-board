import os
import io
import pathlib
import math
import gzip
import json
from time import sleep, time
from multiprocessing import Event as ProcessEvent, Lock as ProcessLock
from threading import Thread, Event as ThreadingEvent
from typing import List, Tuple
from models.regulator.archive_model import ArchiveModel

from models.regulator.enums.control_mode_model import ControlModeModel
from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.enums.heating_circuit_type_model import HeatingCircuitTypeModel
from models.regulator.heating_circuits_model import HeatingCircuitModel
from models.regulator.regulator_settings_model import RegulatorSettingsModel
from models.regulator.enums.temperature_sensor_channel_pins import TemperatureSersorChannelPins

from loggers.default_logger_builder import build as build_default_logger
from regulation.measurements import get_temperature, get_rtc_datetime

process_lock_sensor_reading = ProcessLock()


class RegulationEngine:

    sensors_polling_started = 'The sensors polling thread %d was STARTED.'
    sensors_polling_done = 'The sensors polling thread %d has DONE A STEP.'
    sensors_polling_stopped = 'The sensors polling thread %d was gracefully STOPPED.'

    regulation_polling_started = 'The regulation polling process %d was STARTED.'
    regulation_polling_done = 'The regulation polling process %d has DONE A STEP.'
    regulation_polling_stopped = 'The regulation polling process %d was gracefully STOPPED.'

    def __init__(self, heating_circuit_index: HeatingCircuitIndexModel) -> None:
        self._logger = build_default_logger(f'regulation_engine_logger_{heating_circuit_index}')
        self._heating_circuit_settings = self._get_heating_circuit_settings(heating_circuit_index)
        self._last_receiving_settings_time = time()

    def _get_heating_circuit_settings(self, heating_circuit_index: HeatingCircuitIndexModel) -> HeatingCircuitModel:
        app_root_path = pathlib.Path(os.path.dirname(__file__)).parent.parent
        regulator_settings_path = app_root_path.joinpath('data/settings/regulator_settings.json')

        with open(regulator_settings_path, 'r', encoding='utf-8') as file:
            json = file.read()

        regulator_settings = RegulatorSettingsModel.parse_raw(json)

        return regulator_settings.heating_circuits.items[heating_circuit_index]

    def _get_calcutated_temperatures(self, outdoor_temperature_measured: float) -> Tuple[float, float]:

        temperature_graph = sorted(
            self._heating_circuit_settings.regulator_parameters.temperature_graph.items,
            key=lambda i: i.outdoor_temperature,
            reverse=True
        )

        max_outdoor_temperature = temperature_graph[0].outdoor_temperature
        min_outdoor_temperature = temperature_graph[-1].outdoor_temperature

        if outdoor_temperature_measured >= max_outdoor_temperature:

            supply_pipe_temperature_calculated = temperature_graph[0].supply_pipe_temperature
            return_pipe_temperature_calculated = temperature_graph[0].return_pipe_temperature

        elif outdoor_temperature_measured <= min_outdoor_temperature:
            supply_pipe_temperature_calculated = temperature_graph[-1].supply_pipe_temperature
            return_pipe_temperature_calculated = temperature_graph[-1].return_pipe_temperature

        else:
            for index, item in enumerate(temperature_graph):
                if outdoor_temperature_measured >= item.outdoor_temperature:
                    tg_0 = temperature_graph[index]
                    tg_1 = temperature_graph[index + 1]
                    break

            # approximate
            k = (tg_1.supply_pipe_temperature - tg_0.supply_pipe_temperature) / (tg_1.outdoor_temperature - tg_0.outdoor_temperature)
            b = tg_0.supply_pipe_temperature - tg_0.outdoor_temperature * k
            supply_pipe_temperature_calculated = k * outdoor_temperature_measured + b

            k = (tg_1.return_pipe_temperature - tg_0.return_pipe_temperature) / (tg_1.outdoor_temperature - tg_0.outdoor_temperature)
            b = tg_0.return_pipe_temperature - tg_0.outdoor_temperature * k
            return_pipe_temperature_calculated = k * outdoor_temperature_measured + b

        return supply_pipe_temperature_calculated, return_pipe_temperature_calculated

    def _run_sensors_polling(self, threading_cancellation_event: ThreadingEvent, heating_circuit_index: HeatingCircuitIndexModel) -> None:
        heating_circuit_settings = self._heating_circuit_settings
        regulation_parameters = heating_circuit_settings.regulator_parameters.regulation_parameters

        total_derivarion = 0.0
        previous_derivation = float('inf')
        archive: List[ArchiveModel] = []

        rtc_datetime = get_rtc_datetime()
        last_rtc_getting_time = time()

        # start polling
        self._logger.info(RegulationEngine.sensors_polling_started, heating_circuit_index)

        while True:
            if threading_cancellation_event.is_set():
                self._logger.info(RegulationEngine.sensors_polling_stopped, heating_circuit_index)
                break

            process_lock_sensor_reading.acquire()
            try:
                start_time = time()

                self._logger.debug('HeatingCircuitType: %s', heating_circuit_settings.type)

                if heating_circuit_settings.type == HeatingCircuitTypeModel.HEATING or heating_circuit_settings.type == HeatingCircuitTypeModel.VENTILATION:
                    # 1.1 polling  physical sensors and getting average measured values
                    outdoor_temperature_measured = get_temperature(
                        TemperatureSersorChannelPins.OUTDOOR_TEMPERATURE
                    )
                    room_temperature_measured = get_temperature(
                        TemperatureSersorChannelPins.ROOM_TEMPERATURE
                    )
                    supply_pipe_temperature_measured = get_temperature(
                        TemperatureSersorChannelPins[f'SUPPLY_PIPE_TEMPERATURE_{heating_circuit_index + 1}']
                    )
                    return_pipe_temperature_measured = get_temperature(
                        TemperatureSersorChannelPins[f'RETURN_PIPE_TEMPERATURE_{heating_circuit_index + 1}']
                    )

                    # 1.2 adding a measurement to an archive
                    if time() - last_rtc_getting_time >= 60:
                        rtc_datetime = get_rtc_datetime()
                        last_rtc_getting_time = time()
                        self._logger.debug('Rtc datetime: %s', rtc_datetime)

                    after_start_of_hour = rtc_datetime.replace(minute=1, second=0, microsecond=0)
                    if rtc_datetime >= after_start_of_hour:
                        archive.append(
                            {
                                "datetime": rtc_datetime,
                                "outdoorTemperature": outdoor_temperature_measured,
                                "supplyPipeTemperature": supply_pipe_temperature_measured,
                                "returnPipeTemperature": return_pipe_temperature_measured
                            }
                        )

                    if rtc_datetime.hour == 0 and len(archive) > 0:
                        # writing to a file
                        try:
                            data_path = pathlib.Path(__file__).parent.parent.joinpath(
                                f'data/archives/{rtc_datetime.strftime("%Y-%m-%dT%H:%M:%SZ").replace(":", "_")}.json.gz'
                            )
                            json_text = json.dumps(archive)
                            with gzip.open(data_path) as file:
                                file.write(
                                    json_text.encode()
                                )
                            archive.clear()
                        except:
                            self._logger.error('Error during writing archives!')

                    # 2.1 getting a calculated temperature on the temperature graph
                    supply_pipe_temperature_calculated, return_pipe_temperature_calculated = \
                        self._get_calcutated_temperatures(
                            outdoor_temperature_measured
                        )

                    self._logger.debug('Outdoor and room temperatures: %f', outdoor_temperature_measured, room_temperature_measured)
                    self._logger.debug('Measured values: supply=%f; return=%f',
                                       supply_pipe_temperature_measured,
                                       return_pipe_temperature_measured
                                       )
                    self._logger.debug('Calculed values: supply=%f; return=%f',
                                       supply_pipe_temperature_calculated,
                                       return_pipe_temperature_calculated
                                       )
                    # 2.2 getting derivation
                    room_temperature_influence = heating_circuit_settings \
                        .regulator_parameters \
                        .control_parameters \
                        .room_temperature_influence
                    return_pipe_temperature_influence = heating_circuit_settings \
                        .regulator_parameters \
                        .control_parameters \
                        .return_pipe_temperature_influence

                    derivation = (supply_pipe_temperature_calculated - supply_pipe_temperature_measured) + \
                        (return_pipe_temperature_calculated - return_pipe_temperature_measured) * \
                        return_pipe_temperature_influence(room_temperature_measured - 20) * room_temperature_influence


                    proportionality_factor = heating_circuit_settings \
                        .regulator_parameters \
                        .regulation_parameters \
                        .proportionality_factor
                    integration_factor = heating_circuit_settings \
                        .regulator_parameters \
                        .regulation_parameters \
                        .integration_factor
                    differentiation_factor = heating_circuit_settings \
                        .regulator_parameters \
                        .regulation_parameters \
                        .differentiation_factor

                    # 2.3 calculation of proportional, differentiation and integration parts of the impact
                    if math.isinf(previous_derivation):
                        previous_derivation = derivation

                    proportional_part_impact = derivation * proportionality_factor
                    integration_part_impact = total_derivarion * integration_factor
                    differentiation_part_impact = (previous_derivation - derivation) * differentiation_factor

                    pid_impart = proportional_part_impact + integration_part_impact + differentiation_part_impact

                    previous_derivation = derivation
                    total_derivarion += derivation

                elif heating_circuit_settings.type == HeatingCircuitTypeModel.HOT_WATER:
                    supply_pipe_temperature_measured = get_temperature(
                        TemperatureSersorChannelPins[f'SUPPLY_PIPE_TEMPERATURE_{heating_circuit_index + 1}']
                    )
                    return_pipe_temperature_measured = get_temperature(
                        TemperatureSersorChannelPins[f'RETURN_PIPE_TEMPERATURE_{heating_circuit_index + 1}']
                    )

                    self._logger.debug('Measured values: supply=%f; return=%f',
                                       supply_pipe_temperature_measured,
                                       return_pipe_temperature_measured
                                       )

                end_time = time()
            finally:
                process_lock_sensor_reading.release()

            delta = end_time - start_time
            # TODO: measutement unit (factor) of calculation_period
            if delta < regulation_parameters.calculation_period / 10:
                sleep(regulation_parameters.calculation_period / 10 - delta)

            self._logger.info(RegulationEngine.sensors_polling_done, heating_circuit_index)

    def run(self, process_cancellation_event: ProcessEvent, heating_circuit_index: HeatingCircuitIndexModel) -> None:
        self._logger.info(RegulationEngine.regulation_polling_started, heating_circuit_index)

        # start polling temperature sensors and calculation
        threading_cancellation_event = ThreadingEvent()
        polling_thread = Thread(
            target=self._run_sensors_polling,
            args=(threading_cancellation_event, heating_circuit_index)
        )
        polling_thread.start()

        while True:
            if process_cancellation_event.is_set():
                threading_cancellation_event.set()
                while polling_thread.is_alive():
                    pass

                self._logger.info(RegulationEngine.regulation_polling_stopped, heating_circuit_index)

                break

            # refresh settings
            regulation_parameters = self._heating_circuit_settings.regulator_parameters.regulation_parameters

            current_receiving_settings_time = time()
            if current_receiving_settings_time - self._last_receiving_settings_time > regulation_parameters.calculation_period * 5:
                self._heating_circuit_settings = self._get_heating_circuit_settings(heating_circuit_index)
                self._last_receiving_settings_time = time()

            # get valuable settings values
            control_mode = self._heating_circuit_settings.regulator_parameters.control_parameters.control_mode

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

            self._logger.info(RegulationEngine.regulation_polling_done, heating_circuit_index)
