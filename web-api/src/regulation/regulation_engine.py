import os
import pathlib
import math
import gzip
import json
from datetime import datetime
from time import sleep, time
from multiprocessing import Event as ProcessEvent, Lock as ProcessLock
from threading import Thread, Event as ThreadingEvent
from typing import List

import regulation.equipments as equipments
from loggers.default_logger_builder import build as build_default_logger
from models.regulator.archive_model import ArchiveModel
from models.regulator.enums.control_mode_model import ControlModeModel
from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.enums.heating_circuit_type_model import HeatingCircuitTypeModel
from models.regulator.heating_circuits_model import HeatingCircuitModel
from models.regulator.pid_impact_entry_model import PidImpactEntryModel, PipImpactResultModel
from models.regulator.regulator_settings_model import RegulatorSettingsModel
from models.regulator.enums.temperature_sensor_channel_pins import TemperatureSersorChannelPins
from models.regulator.calculated_temperatures_model import CalculatedTemperaturesModel

process_lock_sensor_reading = ProcessLock()


class RegulationEngine:

    sensors_polling_started_msg = 'The sensors polling thread %d was STARTED.'
    sensors_polling_done_msg = 'The sensors polling thread %d has DONE A STEP.'
    sensors_polling_stopped_msg = 'The sensors polling thread %d was gracefully STOPPED.'

    regulation_polling_started_msg = 'The regulation polling process %d was STARTED.'
    regulation_polling_done_msg = 'The regulation polling process %d has DONE A STEP.'
    regulation_polling_stopped_msg = 'The regulation polling process %d was gracefully STOPPED.'

    mearured_temperatures_msg = 'Measured temperatures: OUTDOOR=%f, ROOM=%f SUPPLY=%f; RETURN=%f'
    calculated_temperatures_msg = 'Calculed temperatures: SUPPLY=%f; RETURN=%f'

    def __init__(self, heating_circuit_index: HeatingCircuitIndexModel) -> None:
        self._heating_circuit_index = heating_circuit_index
        self._logger = build_default_logger(f'regulation_engine_logger_{heating_circuit_index}')
        self._heating_circuit_settings: HeatingCircuitModel = self._get_heating_circuit_settings()
        self._last_receiving_settings_time = time()
        self._rtc_datetime: datetime = datetime.utcnow()
        self._last_rtc_getting_time = time()
        self._archives: List[ArchiveModel] = []

    def _get_heating_circuit_settings(self) -> HeatingCircuitModel:
        app_root_path = pathlib.Path(os.path.dirname(__file__)).parent.parent
        regulator_settings_path = app_root_path.joinpath('data/settings/regulator_settings.json')

        with open(regulator_settings_path, 'r', encoding='utf-8') as file:
            json = file.read()

        regulator_settings = RegulatorSettingsModel.parse_raw(json)

        return regulator_settings.heating_circuits.items[self._heating_circuit_index]

    def _update_settings(self):
        calculation_period = self._heating_circuit_settings.regulator_parameters.regulation_parameters.calculation_period
        current_receiving_settings_time = time()

        if current_receiving_settings_time - self._last_receiving_settings_time > calculation_period * 5:
            self._heating_circuit_settings = self._get_heating_circuit_settings()
            self._last_receiving_settings_time = time()

    def _get_calcutated_temperatures(self, archive: ArchiveModel) -> CalculatedTemperaturesModel:

        temperature_graph = sorted(
            self._heating_circuit_settings.regulator_parameters.temperature_graph.items,
            key=lambda i: i.outdoor_temperature,
            reverse=True
        )
        outdoor_temperature_measured = archive.outdoor_temperature

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

        self._logger.debug(
            RegulationEngine.calculated_temperatures_msg,
            supply_pipe_temperature_calculated,
            return_pipe_temperature_calculated
        )

        return CalculatedTemperaturesModel(
            supply_pipe_temperature=supply_pipe_temperature_calculated,
            return_pipe_temperature=return_pipe_temperature_calculated
        )

    def _save_archives(self, archive: ArchiveModel):
        # clear the current archives if the new day has come
        if self._archives:
            self._archives.sort(key=lambda archive: archive.datetime)
            latest_archive_day = self._archives[-1].datetime.day
            if latest_archive_day < self._rtc_datetime.day:
                self._archives.clear()

        # calculate the hour boundaries
        start_current_hour = self._rtc_datetime.replace(minute=1, second=0, microsecond=0)
        end_current_hour = self._rtc_datetime.replace(minute=59, second=59, microsecond=0)

        is_already_saved = next((
            archive for archive in self._archives
            if archive.datetime >= start_current_hour and archive.datetime <= end_current_hour
        ),  None) is not None

        if is_already_saved:
            return

        # save to an archive and rewrite a file of archives
        if self._rtc_datetime >= start_current_hour:
            self._archives.append(archive)

            try:
                start_current_day = self._rtc_datetime.replace(hour=0, minute=0, second=0, microsecond=0)
                data_path = pathlib.Path(__file__).parent.parent.joinpath(
                    f'data/archives/{self._heating_circuit_settings.type}_{self._heating_circuit_index + 1}_{start_current_day.strftime("%Y-%m-%dT%H:%M:%SZ").replace(":", "_")}.json.gz'
                )
                json_text = json.dumps(self._archives)
                with gzip.open(data_path, mode='w') as file:
                    file.write(
                        json_text.encode()
                    )
            except:
                self._logger.error('Error during writing archives!')

    def _get_archive(self) -> ArchiveModel:
        outdoor_temperature_measured = equipments.get_temperature(
            TemperatureSersorChannelPins.OUTDOOR_TEMPERATURE
        )
        room_temperature_measured = equipments.get_temperature(
            TemperatureSersorChannelPins.ROOM_TEMPERATURE
        )
        supply_pipe_temperature_measured = equipments.get_temperature(
            TemperatureSersorChannelPins[f'SUPPLY_PIPE_TEMPERATURE_{self._heating_circuit_index + 1}']
        )
        return_pipe_temperature_measured = equipments.get_temperature(
            TemperatureSersorChannelPins[f'RETURN_PIPE_TEMPERATURE_{self._heating_circuit_index + 1}']
        )

        self._logger.debug(
            RegulationEngine.mearured_temperatures_msg,
            outdoor_temperature_measured,
            room_temperature_measured,
            supply_pipe_temperature_measured,
            return_pipe_temperature_measured
        )

        return ArchiveModel(
            datetime=self._rtc_datetime,
            outdoor_temperature=outdoor_temperature_measured,
            room_temperature=room_temperature_measured,
            supply_pipe_temperature=supply_pipe_temperature_measured,
            return_pipe_temperature=return_pipe_temperature_measured,
        )

    def _update_rtc_datetime(self):
        if time() - self._last_rtc_getting_time >= 60:
            self._rtc_datetime = equipments.get_rtc_datetime()
            self._last_rtc_getting_time = time()

    def _get_pid_impact(self, entry: PidImpactEntryModel) -> PipImpactResultModel:
        calc_temperatures = self._get_calcutated_temperatures(entry.archive)

        room_temperature_influence = self._heating_circuit_settings \
            .regulator_parameters \
            .control_parameters \
            .room_temperature_influence

        if room_temperature_influence is None:
            room_temperature_influence = 0.0

        return_pipe_temperature_influence = self._heating_circuit_settings \
            .regulator_parameters \
            .control_parameters \
            .return_pipe_temperature_influence

        derivation = (calc_temperatures.supply_pipe_temperature - calc_temperatures.supply_pipe_temperature) + \
            (entry.archive.return_pipe_temperature - entry.archive.return_pipe_temperature) * return_pipe_temperature_influence + \
            (entry.archive.room_temperature - 20) * room_temperature_influence

        proportionality_factor = self._heating_circuit_settings \
            .regulator_parameters \
            .regulation_parameters \
            .proportionality_factor
        integration_factor = self._heating_circuit_settings \
            .regulator_parameters \
            .regulation_parameters \
            .integration_factor
        differentiation_factor = self._heating_circuit_settings \
            .regulator_parameters \
            .regulation_parameters \
            .differentiation_factor

        # 2.3 calculation of proportional, differentiation and integration parts of the impact
        if math.isinf(entry.previous_derivation):
            entry.previous_derivation = derivation

        proportional_part_impact = derivation * proportionality_factor
        integration_part_impact = entry.total_derivation * integration_factor
        differentiation_part_impact = (entry.previous_derivation - derivation) * differentiation_factor

        # TODO: need to normalize to 100%
        pid_impart = proportional_part_impact + integration_part_impact + differentiation_part_impact

        return PipImpactResultModel(
            impact=pid_impart,
            derivarion=derivation
        )

    def _run_sensors_polling(self, threading_cancellation_event: ThreadingEvent) -> None:
        heating_circuit_settings = self._heating_circuit_settings
        regulation_parameters = heating_circuit_settings.regulator_parameters.regulation_parameters

        total_derivarion: float = 0.0
        previous_derivation: float = float('inf')

        self._rtc_datetime = equipments.get_rtc_datetime()
        self._last_rtc_getting_time = time()

        # start polling
        self._logger.info(RegulationEngine.sensors_polling_started_msg, self._heating_circuit_index)

        while True:
            if threading_cancellation_event.is_set():
                self._logger.info(RegulationEngine.sensors_polling_stopped_msg, self._heating_circuit_index)
                break

            process_lock_sensor_reading.acquire()
            try:
                start_time = time()

                self._logger.debug('HeatingCircuitType: %s', heating_circuit_settings.type)

                if heating_circuit_settings.type == HeatingCircuitTypeModel.HEATING or heating_circuit_settings.type == HeatingCircuitTypeModel.VENTILATION:
                    # polling physical sensors and getting average measured values
                    archive = self._get_archive()
                    # updating rtc datetime every 60 seconds
                    self._update_rtc_datetime()
                    # adding a measurement to an archive
                    self._save_archives(archive)

                    # calc pid impact
                    pid_impact_result = self._get_pid_impact(
                        entry=PidImpactEntryModel(
                            archive=archive,
                            previous_derivation=previous_derivation,
                            total_derivation=total_derivarion
                        )
                    )

                    previous_derivation = pid_impact_result.derivarion
                    total_derivarion += pid_impact_result.derivarion

                elif heating_circuit_settings.type == HeatingCircuitTypeModel.HOT_WATER:
                    pass

                end_time = time()
            finally:
                process_lock_sensor_reading.release()

            delta = end_time - start_time
            # TODO: measutement unit (factor) of calculation_period
            if delta < regulation_parameters.calculation_period / 10:
                sleep(regulation_parameters.calculation_period / 10 - delta)

            self._logger.info(RegulationEngine.sensors_polling_done_msg, self._heating_circuit_index)

    def run(self, process_cancellation_event: ProcessEvent) -> None:
        self._logger.info(RegulationEngine.regulation_polling_started_msg, self._heating_circuit_index)

        # start polling temperature sensors and calculation
        threading_cancellation_event = ThreadingEvent()
        polling_thread = Thread(
            target=self._run_sensors_polling,
            args=(threading_cancellation_event)
        )
        polling_thread.start()

        while True:
            if process_cancellation_event.is_set():
                threading_cancellation_event.set()
                while polling_thread.is_alive():
                    pass

                self._logger.info(RegulationEngine.regulation_polling_stopped_msg, self._heating_circuit_index)

                break

            # refresh settings
            self._update_settings()
            regulation_parameters = self._heating_circuit_settings.regulator_parameters.regulation_parameters

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

            self._logger.info(RegulationEngine.regulation_polling_done_msg, self._heating_circuit_index)
