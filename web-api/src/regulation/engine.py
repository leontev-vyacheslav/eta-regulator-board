import logging
import os
import pathlib
import math
import gzip
import bisect
from datetime import datetime
from time import sleep, time
from multiprocessing import Event as ProcessEvent, Lock as ProcessLock
from threading import Thread, Event as ThreadingEvent, Lock as ThreadingLock
from typing import List, Optional
import uuid
from models.regulator.enums.regulation_engine_mode_model import RegulationEngineLoggingLevelModel
from models.regulator.temperature_graph_model import TemperatureGraphItemModel

import regulation.equipments as equipments
from loggers.engine_logger_builder import build as build_logger
from models.regulator.archives_model import DailySavedArchivesModel
from models.regulator.archive_model import ArchiveModel
from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.enums.heating_circuit_type_model import HeatingCircuitTypeModel
from models.regulator.heating_circuits_model import HeatingCircuitModel
from models.regulator.pid_impact_entry_model import PidImpactEntryModel, PidImpactResultComponentsModel, PidImpactResultModel
from models.regulator.regulator_settings_model import RegulatorSettingsModel
from models.regulator.enums.temperature_sensor_channel_model import TemperatureSensorChannelModel
from regulation.metadata.decorators import regulator_starter_metadata
from utils.datetime_helper import is_last_day_of_month


class RegulationEngine:
    MIN_IMPACT = -6500.00
    MAX_IMPACT = 10361.00

    updating_rtc_period = 60
    default_room_temperature = 20
    default_room_temperature_influence = 0.0
    updating_settings_factor = 5

    start_current_hour_template = {'minute': 1, 'second': 0, 'microsecond': 0}
    end_current_hour_template = {'minute': 59, 'second': 59, 'microsecond': 0}
    start_current_day_template = {'hour': 0, 'minute': 0, 'second': 0, 'microsecond': 0}

    sensors_polling_started_info_msg = 'The sensors polling thread was STARTED.'
    sensors_polling_step_done_debug_msg = 'The sensors polling thread has DONE A STEP.'
    sensors_polling_stopped_info_msg = 'The sensors polling thread was gracefully STOPPED.'
    sensors_polling_slept_debug_msg = 'The sensors polling thread has executed %.6f sec and has slept during %.6f sec.'

    regulation_polling_started_info_msg = 'The regulation polling main thread  was STARTED.'
    regulation_polling_step_done_debug_msg = 'The regulation polling main thread has DONE A STEP.'
    regulation_polling_stopped_info_msg = 'The regulation polling main thread was gracefully STOPPED.'
    regulation_polling_slept_debug_msg = 'The regulation polling main thread has executed %.6f sec and has slept during %.6f sec.'

    measured_temperatures_debug_msg = 'The measured temperatures were obtained: OUTDOOR=%.2f, ROOM=%.2f SUPPLY=%.2f; RETURN=%.2f'
    calculated_temperatures_debug_msg = 'The calculated temperatures were approximated: SUPPLY=%.2f; RETURN=%.2f'
    settings_refresh_debug_msg = 'Settings refresh completed'
    writing_archives_debug_msg = 'Writing archives to file has been completed: %s'
    getting_current_rtc_debug_msg = 'The current RTC datetime: %s'
    pid_impact_calculated_debug_msg = 'PID impact was calculated with a value: IMPACT=%.2f, DEVIATION=%.2f, TOTAL_DEVIATION=%.2f'
    writing_archives_error_msg = 'Error has happened during writing archives: %s'

    def __init__(self, heating_circuit_index: HeatingCircuitIndexModel, process_cancellation_event: ProcessEvent, hardwares_process_lock: ProcessLock, logging_level: RegulationEngineLoggingLevelModel) -> None:
        self._logging_level = logging_level

        self._heating_circuit_index = heating_circuit_index
        self._process_cancellation_event = process_cancellation_event
        self._hardware_process_lock = hardwares_process_lock

        self._pid_impact_threading_lock = ThreadingLock()
        self._shared_pid_impact: Optional[PidImpactResultModel] = None

        self._heating_circuit_settings: HeatingCircuitModel = self._get_settings()

        self._logger = build_logger(
            name=f'regulation_engine_logger',
            heating_circuit_index=heating_circuit_index,
            heating_circuit_type=self._heating_circuit_settings.type,
            default_level=logging.INFO if logging_level == RegulationEngineLoggingLevelModel.NORMAL else logging.DEBUG
        )

        self._last_receiving_settings_time = time()
        self._rtc_datetime: datetime = datetime.utcnow()
        self._last_rtc_getting_time: Optional[float] = None

        self._archives: DailySavedArchivesModel = DailySavedArchivesModel(
            items=[],
            is_last_day_of_month_saved=False
        )

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

            self._logger.debug(RegulationEngine.settings_refresh_debug_msg)

    def _get_calculated_temperatures(self, outdoor_temperature: float) -> TemperatureGraphItemModel:
        accurate_match_tg_item = next(
            (
                item
                for item in self._heating_circuit_settings.regulator_parameters.temperature_graph.items
                if item.outdoor_temperature == outdoor_temperature
            ),
            None
        )

        if accurate_match_tg_item is not None:
            return accurate_match_tg_item

        temperature_graph = sorted(
            self._heating_circuit_settings.regulator_parameters.temperature_graph.items,
            key=lambda i: i.outdoor_temperature
        )
        outdoor_temperature_measured = outdoor_temperature
        outdoor_temperatures = [item.outdoor_temperature for item in temperature_graph]

        pos = bisect.bisect_left(outdoor_temperatures, outdoor_temperature_measured)

        if pos == 0:
            supply_pipe_temperature_calculated = temperature_graph[0].supply_pipe_temperature
            return_pipe_temperature_calculated = temperature_graph[0].return_pipe_temperature
        elif pos == len(outdoor_temperatures):
            supply_pipe_temperature_calculated = temperature_graph[-1].supply_pipe_temperature
            return_pipe_temperature_calculated = temperature_graph[-1].return_pipe_temperature
        else:
            tg_left = temperature_graph[pos - 1]
            tg_right = temperature_graph[pos]
            # interpolate
            k = (tg_right.supply_pipe_temperature - tg_left.supply_pipe_temperature) / \
                (tg_right.outdoor_temperature - tg_left.outdoor_temperature)
            b = tg_left.supply_pipe_temperature - tg_left.outdoor_temperature * k
            supply_pipe_temperature_calculated = k * outdoor_temperature_measured + b

            k = (tg_right.return_pipe_temperature - tg_left.return_pipe_temperature) / \
                (tg_right.outdoor_temperature - tg_left.outdoor_temperature)
            b = tg_left.return_pipe_temperature - tg_left.outdoor_temperature * k
            return_pipe_temperature_calculated = k * outdoor_temperature_measured + b

        self._logger.debug(
            RegulationEngine.calculated_temperatures_debug_msg,
            supply_pipe_temperature_calculated,
            return_pipe_temperature_calculated
        )

        return TemperatureGraphItemModel(
            id=uuid.UUID(int=0).hex,
            outdoor_temperature=outdoor_temperature_measured,
            supply_pipe_temperature=supply_pipe_temperature_calculated,
            return_pipe_temperature=return_pipe_temperature_calculated
        )

    def _get_archive(self) -> ArchiveModel:
        outdoor_temperature_measured = equipments.get_temperature(
            TemperatureSensorChannelModel.OUTDOOR_TEMPERATURE
        )
        room_temperature_measured = equipments.get_temperature(
            TemperatureSensorChannelModel.ROOM_TEMPERATURE
        )
        supply_pipe_temperature_measured = equipments.get_temperature(
            TemperatureSensorChannelModel[f'SUPPLY_PIPE_TEMPERATURE_{self._heating_circuit_index + 1}']
        )
        return_pipe_temperature_measured = equipments.get_temperature(
            TemperatureSensorChannelModel[f'RETURN_PIPE_TEMPERATURE_{self._heating_circuit_index + 1}']
        )

        self._logger.debug(
            RegulationEngine.measured_temperatures_debug_msg,
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
        if self._archives.items:
            self._archives.items.sort(key=lambda archive: archive.datetime)
            latest_archive_day = self._archives.items[-1].datetime.day
            latest_archive_month = self._archives.items[-1].datetime.month

            if latest_archive_day < self._rtc_datetime.day and latest_archive_month == self._rtc_datetime.month:
                self._archives.items.clear()

            if len(self._archives.items) == 24 and is_last_day_of_month(self._rtc_datetime):
                self._archives.items.clear()
                self._archives.is_last_day_of_month_saved = True

                return

        if not is_last_day_of_month(self._rtc_datetime) and self._archives.is_last_day_of_month_saved:
            self._archives.is_last_day_of_month_saved = False

        # calculate the hour boundaries
        start_current_hour = self._rtc_datetime.replace(**RegulationEngine.start_current_hour_template)
        end_current_hour = self._rtc_datetime.replace(**RegulationEngine.end_current_hour_template)

        is_already_saved = next((
            archive for archive in self._archives.items
            if archive.datetime >= start_current_hour and archive.datetime <= end_current_hour
        ),  None) is not None

        if is_already_saved:
            return

        # save to an archive and rewrite a file of archives
        if self._rtc_datetime >= start_current_hour and not self._archives.is_last_day_of_month_saved:
            self._archives.items.append(archive)

            try:
                start_current_day = self._rtc_datetime.replace(**RegulationEngine.start_current_day_template)
                archive_file_name = f'{self._heating_circuit_settings.type.name}_{self._heating_circuit_index}_{start_current_day.strftime("%Y-%m-%dT%H:%M:%SZ").replace(":", "_")}.json.gz'
                data_path = pathlib.Path(__file__).parent.parent.parent.joinpath(
                    f'data/archives/{archive_file_name}'
                )

                json_text = self._archives.json(by_alias=True)

                with gzip.open(data_path, mode='w') as file:
                    file.write(
                        json_text.encode()
                    )

                self._logger.debug(RegulationEngine.writing_archives_debug_msg, archive_file_name)

            except Exception as ex:
                self._logger.error(RegulationEngine.writing_archives_error_msg, str(ex))

    def _refresh_rtc_datetime(self):
        if self._last_rtc_getting_time is None or time() - self._last_rtc_getting_time >= RegulationEngine.updating_rtc_period:
            self._rtc_datetime = equipments.get_rtc_datetime()
            self._last_rtc_getting_time = time()

            self._logger.debug(RegulationEngine.getting_current_rtc_debug_msg, f'{self._rtc_datetime}')

    def _get_pid_impact_components(self, entry: PidImpactEntryModel) -> PidImpactResultComponentsModel:
        calc_temperatures = self._get_calculated_temperatures(entry.archive.outdoor_temperature)

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

        # TODO: missing sensors
        deviation = (calc_temperatures.supply_pipe_temperature - entry.archive.supply_pipe_temperature) + \
            (calc_temperatures.return_pipe_temperature - entry.archive.return_pipe_temperature) * return_pipe_temperature_influence + \
            (entry.archive.room_temperature - RegulationEngine.default_room_temperature) * room_temperature_influence

        total_deviation = entry.total_deviation + deviation

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
        if math.isinf(entry.deviation):
            entry.deviation = deviation

        proportional_part_impact = deviation * proportionality_factor
        integration_part_impact = total_deviation * integration_factor
        differentiation_part_impact = (entry.deviation - deviation) * differentiation_factor

        self._logger.debug(
            RegulationEngine.pid_impact_calculated_debug_msg,
            proportional_part_impact + integration_part_impact + differentiation_part_impact,
            deviation,
            total_deviation
        )

        return PidImpactResultComponentsModel(
            deviation=deviation,
            total_deviation=total_deviation,
            proportional_impact=proportional_part_impact,
            integration_impact=integration_part_impact,
            differentiation_impact=differentiation_part_impact
        )

    def _get_pid_impact_result(self, entry: PidImpactEntryModel) -> PidImpactResultModel:
        pid_impact_components = self._get_pid_impact_components(entry)

        pid_impart = pid_impact_components.proportional_impact + \
            pid_impact_components.integration_impact + \
            pid_impact_components.differentiation_impact

        percented_pid_impart = 0.0

        pid_impact_range_middle = (RegulationEngine.MAX_IMPACT - RegulationEngine.MIN_IMPACT) / 2
        if pid_impart > pid_impact_range_middle:
            percented_pid_impart = 100 * pid_impart / (RegulationEngine.MAX_IMPACT - pid_impact_range_middle)
        elif pid_impart < pid_impact_range_middle:
            percented_pid_impart = -100 * pid_impart / (pid_impact_range_middle - RegulationEngine.MIN_IMPACT)
        else:
            percented_pid_impart = 0.0

        return PidImpactResultModel(
            impact=percented_pid_impart,
            deviation=pid_impact_components.deviation,
            total_deviation=pid_impact_components.total_deviation
        )

    def _start_sensors_polling(self, threading_cancellation_event: ThreadingEvent) -> None:
        self._logger.info(RegulationEngine.sensors_polling_started_info_msg)

        total_deviation: float = 0.0
        deviation: float = float('inf')

        self._refresh_rtc_datetime()

        # start polling

        while True:
            if threading_cancellation_event.is_set():
                # stop polling
                self._logger.info(RegulationEngine.sensors_polling_stopped_info_msg)
                break

            start_time = time()

            # HEATING || VENTILATION
            if self._heating_circuit_type in [HeatingCircuitTypeModel.HEATING, HeatingCircuitTypeModel.VENTILATION]:

                with self._hardware_process_lock:
                    # updating rtc datetime every updating_rtc_period seconds
                    self._refresh_rtc_datetime()
                    # polling physical sensors and getting average measured values
                    archive = self._get_archive()

                # adding a measurement to an archive
                self._save_archives(archive)

                # calc pid impact
                pid_impact_result = self._get_pid_impact_result(
                    entry=PidImpactEntryModel(
                        archive=archive,
                        deviation=deviation,
                        total_deviation=total_deviation
                    )
                )

                with self._pid_impact_threading_lock:
                    self._shared_pid_impact = PidImpactResultModel(
                        impact=pid_impact_result.impact,
                        deviation=pid_impact_result.deviation,
                        total_deviation=pid_impact_result.total_deviation
                    )

                deviation = pid_impact_result.deviation
                total_deviation = pid_impact_result.total_deviation

            # HOT_WATER
            else:
                pass

            end_time = time()
            delta = end_time - start_time
            if delta < self._calculation_period:
                sleep(self._calculation_period - delta)
                self._logger.debug(RegulationEngine.sensors_polling_slept_debug_msg, delta, self._calculation_period - delta)

            self._logger.debug(RegulationEngine.sensors_polling_step_done_debug_msg)

    def start(self) -> None:
        # start regulation thread
        self._logger.info(RegulationEngine.regulation_polling_started_info_msg)

        # start polling temperature sensors and calculation
        threading_cancellation_event = ThreadingEvent()
        polling_thread = Thread(
            target=self._start_sensors_polling,
            args=(threading_cancellation_event, )
        )
        polling_thread.start()

        while True:
            if self._process_cancellation_event.is_set():
                threading_cancellation_event.set()
                while polling_thread.is_alive():
                    pass
                # stop regulation thread
                self._logger.info(RegulationEngine.regulation_polling_stopped_info_msg)

                break

            # measure time of the beginning of the act on the regulator valve
            start_time = time()

            # get valuable settings values
            regulation_parameters = self._heating_circuit_settings.regulator_parameters.regulation_parameters

            pid_impact: Optional[PidImpactResultModel] = None

            with self._pid_impact_threading_lock:
                if self._shared_pid_impact is not None:
                    pid_impact = PidImpactResultModel(
                        impact=self._shared_pid_impact.impact,
                        deviation=self._shared_pid_impact.deviation,
                        total_deviation=self._shared_pid_impact.total_deviation
                    )

            if pid_impact is not None:
                # TODO: missing sensors
                # TODO: reset total deviation, deviation when twhen limits exceeded
                with self._hardware_process_lock:
                    equipments.set_valve_impact(
                        heating_circuit_index=self._heating_circuit_index,
                        impact_sign=pid_impact.impact > 0.0,
                        impact_duration=abs(pid_impact.impact * regulation_parameters.pulse_duration_valve)
                    )

            end_time = time()
            delta = end_time - start_time

            # wait for the end of period of the act on the regulator valve
            if delta < regulation_parameters.pulse_duration_valve:
                sleep(regulation_parameters.pulse_duration_valve - delta)
                self._logger.debug(RegulationEngine.regulation_polling_slept_debug_msg,
                                   delta, regulation_parameters.pulse_duration_valve - delta)

            self._logger.debug(RegulationEngine.regulation_polling_step_done_debug_msg)


@regulator_starter_metadata(
    heating_circuit_types=[
        HeatingCircuitTypeModel.HEATING,
        HeatingCircuitTypeModel.VENTILATION,
        HeatingCircuitTypeModel.HOT_WATER
    ]
)
def regulation_engine_starter(heating_circuit_index: HeatingCircuitIndexModel, process_cancellation_event: ProcessEvent, hardware_process_lock: ProcessLock):
    engine = RegulationEngine(
        heating_circuit_index=heating_circuit_index,
        process_cancellation_event=process_cancellation_event,
        hardwares_process_lock=hardware_process_lock,
        logging_level=RegulationEngineLoggingLevelModel.FULL_TRACE
    )
    engine.start()
