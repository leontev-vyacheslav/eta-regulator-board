import os
import pathlib
import math
import gzip
import json
from datetime import datetime
from time import sleep, time
from multiprocessing import Event as ProcessEvent, Lock as ProcessLock
from threading import Thread, Event as ThreadingEvent, Lock as ThreadingLock
from typing import List, Optional

import regulation.equipments as equipments
from loggers.default_logger_builder import build as build_default_logger
from models.regulator.archive_model import ArchiveModel
from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.enums.heating_circuit_type_model import HeatingCircuitTypeModel
from models.regulator.heating_circuits_model import HeatingCircuitModel
from models.regulator.pid_impact_entry_model import PidImpactEntryModel, PidImpactResultModel
from models.regulator.regulator_settings_model import RegulatorSettingsModel
from models.regulator.enums.temperature_sensor_channel_pins import TemperatureSensorChannels
from models.regulator.calculated_temperatures_model import CalculatedTemperaturesModel


class RegulationEngine:
    updating_rtc_period = 60
    default_room_temperature = 20
    default_room_temperature_influence = 0.0
    updating_settings_factor = 5

    sensors_polling_started_msg = 'The sensors polling thread (%d, %s) was STARTED.'
    sensors_polling_done_msg = 'The sensors polling thread (%d, %s) has DONE A STEP.'
    sensors_polling_stopped_msg = 'The sensors polling thread (%d, %s) was gracefully STOPPED.'

    regulation_polling_started_msg = 'The regulation polling process (%d, %s) was STARTED.'
    regulation_polling_done_msg = 'The regulation polling process(%d, %s) has DONE A STEP.'
    regulation_polling_stopped_msg = 'The regulation polling process (%d, %s) was gracefully STOPPED.'

    measured_temperatures_msg = 'Measured temperatures (%d, %s): OUTDOOR=%f, ROOM=%f SUPPLY=%f; RETURN=%f'
    calculated_temperatures_msg = 'Calculated temperatures (%d, %s): SUPPLY=%f; RETURN=%f'

    def __init__(self, heating_circuit_index: HeatingCircuitIndexModel, process_cancellation_event: ProcessEvent, hardwares_process_lock: ProcessLock) -> None:
        self._heating_circuit_index = heating_circuit_index
        self._process_cancellation_event = process_cancellation_event
        self._hardware_process_lock: ProcessLock = hardwares_process_lock

        self._pid_impact_threading_lock = ThreadingLock()
        self._shared_pid_impact: Optional[PidImpactResultModel] = None

        self._logger = build_default_logger(f'regulation_engine_logger_{heating_circuit_index}')

        self._heating_circuit_settings: HeatingCircuitModel = self._get_settings()

        self._last_receiving_settings_time = time()
        self._rtc_datetime: datetime = datetime.utcnow()
        self._last_rtc_getting_time = time()

        self._archives: List[ArchiveModel] = []

        # class members depending on settings
        self._heating_circuit_type = self._heating_circuit_settings.type
        self._calculation_period = self._heating_circuit_settings.regulator_parameters.regulation_parameters.calculation_period / 10

    def _get_settings(self) -> HeatingCircuitModel:
        app_root_path = pathlib.Path(os.path.dirname(__file__)).parent.parent
        regulator_settings_path = app_root_path.joinpath('data/settings/regulator_settings.json')

        with open(regulator_settings_path, mode='r', encoding='utf-8') as file:
            json = file.read()

        regulator_settings = RegulatorSettingsModel.parse_raw(json)

        return regulator_settings.heating_circuits.items[self._heating_circuit_index]

    def _refresh_settings(self):
        current_receiving_settings_time = time()

        if current_receiving_settings_time - self._last_receiving_settings_time > self._calculation_period * RegulationEngine.updating_settings_factor:
            self._heating_circuit_settings = self._get_settings()
            self._last_receiving_settings_time = time()
            # class members depending on settings
            self._heating_circuit_type = self._heating_circuit_settings.type
            self._calculation_period = self._heating_circuit_settings.regulator_parameters.regulation_parameters.calculation_period / 10

    def _get_calculated_temperatures(self, archive: ArchiveModel) -> CalculatedTemperaturesModel:
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
            self._heating_circuit_index, self._heating_circuit_type.name,
            supply_pipe_temperature_calculated,
            return_pipe_temperature_calculated
        )

        return CalculatedTemperaturesModel(
            supply_pipe_temperature=supply_pipe_temperature_calculated,
            return_pipe_temperature=return_pipe_temperature_calculated
        )

    def _get_archive(self) -> ArchiveModel:
        outdoor_temperature_measured = equipments.get_temperature(
            TemperatureSensorChannels.OUTDOOR_TEMPERATURE
        )
        room_temperature_measured = equipments.get_temperature(
            TemperatureSensorChannels.ROOM_TEMPERATURE
        )
        supply_pipe_temperature_measured = equipments.get_temperature(
            TemperatureSensorChannels[f'SUPPLY_PIPE_TEMPERATURE_{self._heating_circuit_index + 1}']
        )
        return_pipe_temperature_measured = equipments.get_temperature(
            TemperatureSensorChannels[f'RETURN_PIPE_TEMPERATURE_{self._heating_circuit_index + 1}']
        )

        self._logger.debug(
            RegulationEngine.measured_temperatures_msg,
            self._heating_circuit_index, self._heating_circuit_type.name,
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

    def _refresh_rtc_datetime(self):
        if time() - self._last_rtc_getting_time >= RegulationEngine.updating_rtc_period:
            self._rtc_datetime = equipments.get_rtc_datetime()
            self._last_rtc_getting_time = time()

    def _get_pid_impact(self, entry: PidImpactEntryModel) -> PidImpactResultModel:
        calc_temperatures = self._get_calculated_temperatures(entry.archive)

        room_temperature_influence = self._heating_circuit_settings \
            .regulator_parameters \
            .control_parameters \
            .room_temperature_influence

        if room_temperature_influence is None:
            room_temperature_influence = RegulationEngine.default_room_temperature_influence

        return_pipe_temperature_influence = self._heating_circuit_settings \
            .regulator_parameters \
            .control_parameters \
            .return_pipe_temperature_influence

        derivation = (calc_temperatures.supply_pipe_temperature - entry.archive.supply_pipe_temperature) + \
            (calc_temperatures.return_pipe_temperature - entry.archive.return_pipe_temperature) * return_pipe_temperature_influence + \
            (entry.archive.room_temperature - RegulationEngine.default_room_temperature) * room_temperature_influence

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

        return PidImpactResultModel(
            impact=pid_impart,
            derivation=derivation
        )

    def _start_sensors_polling(self, threading_cancellation_event: ThreadingEvent) -> None:

        total_derivation: float = 0.0
        previous_derivation: float = float('inf')

        self._rtc_datetime = equipments.get_rtc_datetime()
        self._last_rtc_getting_time = time()

        # start polling
        self._logger.info(RegulationEngine.sensors_polling_started_msg, self._heating_circuit_index, self._heating_circuit_type.name)

        while True:
            if threading_cancellation_event.is_set():
                # stop polling
                self._logger.info(RegulationEngine.sensors_polling_stopped_msg,
                                  self._heating_circuit_index, self._heating_circuit_type.name)
                break

            start_time = time()
            if self._heating_circuit_type in [HeatingCircuitTypeModel.HEATING, HeatingCircuitTypeModel.VENTILATION]:
                self._hardware_process_lock.acquire()
                try:
                    # updating rtc datetime every updating_rtc_period seconds
                    self._refresh_rtc_datetime()
                    # polling physical sensors and getting average measured values
                    archive = self._get_archive()
                finally:
                    self._hardware_process_lock.release()

                # adding a measurement to an archive
                self._save_archives(archive)

                # calc pid impact
                pid_impact_result = self._get_pid_impact(
                    entry=PidImpactEntryModel(
                        archive=archive,
                        previous_derivation=previous_derivation,
                        total_derivation=total_derivation
                    )
                )

                self._pid_impact_threading_lock.acquire()
                try:
                    self._shared_pid_impact = pid_impact_result
                finally:
                    self._pid_impact_threading_lock.release()

                previous_derivation = pid_impact_result.derivation
                total_derivation += pid_impact_result.derivation
            else:
                pass

            end_time = time()
            delta = end_time - start_time
            if delta < self._calculation_period:
                sleep(self._calculation_period - delta)

            self._logger.info(RegulationEngine.sensors_polling_done_msg, self._heating_circuit_index, self._heating_circuit_type.name)

    def start(self) -> None:
        # start regulation process
        self._logger.info(RegulationEngine.regulation_polling_started_msg, self._heating_circuit_index, self._heating_circuit_type.name)

        # start polling temperature sensors and calculation
        threading_cancellation_event = ThreadingEvent()
        polling_thread = Thread(
            target=self._start_sensors_polling,
            args=(threading_cancellation_event)
        )
        polling_thread.start()

        while True:
            if self._process_cancellation_event.is_set():
                threading_cancellation_event.set()
                while polling_thread.is_alive():
                    pass
                # stop regulation process
                self._logger.info(
                    RegulationEngine.regulation_polling_stopped_msg,
                    self._heating_circuit_index,
                    self._heating_circuit_type.name
                )

                break

            # measure time of the beginning of the act on the regulator valve
            start_time = time()

            # get valuable settings values
            regulation_parameters = self._heating_circuit_settings.regulator_parameters.regulation_parameters

            pid_impact: Optional[PidImpactResultModel] = None

            self._pid_impact_threading_lock.acquire()
            try:
                if self._shared_pid_impact is not None:
                    pid_impact = PidImpactResultModel(
                        impact=self._shared_pid_impact.impact,
                        derivation=self._shared_pid_impact.derivation,
                    )
            finally:
                self._pid_impact_threading_lock.release()

            if pid_impact is not None:

                self._hardware_process_lock.acquire()
                try:
                    equipments.set_valve_impact(
                        heating_circuit_index=self._heating_circuit_index,
                        impact_sign=pid_impact.impact > 0.0,
                        delay=pid_impact.impact * regulation_parameters.pulse_duration_valve
                    )
                finally:
                    self._hardware_process_lock.release()
                pass

            end_time = time()
            delta = end_time - start_time

            # wait for the end of period of the act on the regulator valve
            if delta < regulation_parameters.pulse_duration_valve:
                sleep(regulation_parameters.pulse_duration_valve - delta)

            self._logger.info(RegulationEngine.regulation_polling_done_msg, self._heating_circuit_index, self._heating_circuit_type.name)


def regulation_engine_starter(heating_circuit_index: HeatingCircuitIndexModel, process_cancellation_event: ProcessEvent, hardware_process_lock: ProcessLock):
    engine = RegulationEngine(
        heating_circuit_index=heating_circuit_index,
        process_cancellation_event=process_cancellation_event,
        hardwares_process_lock=hardware_process_lock
    )
    engine.start()
