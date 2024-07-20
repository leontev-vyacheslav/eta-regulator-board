from enum import IntEnum
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
from typing import Optional
import uuid
from models.regulator.enums.outdoor_temperature_sensor_failure_action_type_model import OutdoorTemperatureSensorFailureActionTypeModel
from models.regulator.enums.supply_pipe_temperature_sensor_failure_action_type_model import SupplyPipeTemperatureSensorFailureActionTypeModel

import regulation.equipments as equipments
from loggers.engine_logger_builder import build as build_logger
from models.regulator.enums.regulation_engine_mode_model import RegulationEngineLoggingLevelModel
from models.regulator.enums.control_mode_model import ControlModeModel
from models.regulator.temperature_graph_model import TemperatureGraphItemModel
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


class FailureActionTypeModel(IntEnum):
    NO_ACTION = 1
    CLOSE_VALVE = 2
    OPEN_VALVE = 3
    ANALOG_VALVE_ERROR = 4
    TEMPERATURE_SUSTENANCE = 5
    NO_FAILURE = 6


class RegulationEngine:
    updating_rtc_period = 60
    default_room_temperature = 20
    default_room_temperature_influence = 0.0
    default_return_temperature_influence = 0.0
    updating_settings_factor = 5

    start_current_hour_template = {'minute': 1, 'second': 0, 'microsecond': 0}
    end_current_hour_template = {'minute': 59, 'second': 59, 'microsecond': 0}
    start_current_day_template = {'hour': 0, 'minute': 0, 'second': 0, 'microsecond': 0}

    sensors_polling_started_info_msg = 'The polling thread was STARTED.'
    sensors_polling_stopped_info_msg = 'The polling thread was STOPPED.'
    sensors_polling_slept_debug_msg = 'The polling thread executed/slept during %.6f / %.6f sec.\r\n'

    regulation_started_info_msg = 'The regulation thread  was STARTED.'
    regulation_stopped_info_msg = 'The regulation thread was STOPPED.'
    regulation_slept_debug_msg = 'The regulation thread executed/slept during %.6f / %.6f sec.'

    measured_temperatures_debug_msg = 'The measured temperatures: OUTDOOR=%.2f, ROOM=%.2f SUPPLY=%.2f; RETURN=%.2f'
    calculated_temperatures_debug_msg = 'The calculated temperatures: SUPPLY=%.2f; RETURN=%.2f'
    settings_refresh_debug_msg = 'Settings was refreshed'
    writing_archives_debug_msg = 'Writing archives has been completed: %s'
    getting_current_rtc_debug_msg = 'The current RTC: %s'
    pid_impact_components_debug_msg = 'PID impact components: P=%.2f, I=%.2f, D=%.2f, SUM=%.2f DEV=%.2f, TOTAL=%.2f'
    pid_impact_result_debug_msg = 'PID impact result: RES=%.2f%%'
    writing_archives_error_msg = 'Error has happened during writing archives: %s'

    def __init__(self, heating_circuit_index: HeatingCircuitIndexModel, process_cancellation_event: ProcessEvent, hardwares_process_lock: ProcessLock, logging_level: RegulationEngineLoggingLevelModel) -> None:
        self._logging_level = logging_level

        self._heating_circuit_index = heating_circuit_index
        self._process_cancellation_event = process_cancellation_event
        self._hardware_process_lock = hardwares_process_lock

        self._shared_pid_impact_result_lock = ThreadingLock()
        self._shared_pid_impact_result: Optional[PidImpactResultModel] = None

        self._shared_failure_action_state_lock = ThreadingLock()
        self._shared_failure_action_state = FailureActionTypeModel.NO_FAILURE

        self._heating_circuit_settings: HeatingCircuitModel = self._get_settings()

        # log_name = f'{self._heating_circuit_settings.type.name}_{self._heating_circuit_index}_{datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ").replace(":", "_")}.log'
        # log_path = pathlib.Path(__file__).parent.parent.parent.joinpath(
        #     f'log/{log_name}'
        # )

        self._logger = build_logger(
            name=f'regulation_engine_logger',
            heating_circuit_index=heating_circuit_index,
            heating_circuit_type=self._heating_circuit_settings.type,
            default_level=logging.INFO if logging_level == RegulationEngineLoggingLevelModel.NORMAL else logging.DEBUG,
            # default_handler=logging.FileHandler(log_path)
        )

        self._last_refreshing_settings_time = time()
        self._rtc_datetime: datetime = datetime.utcnow()
        self._last_refreshing_rtc_time: Optional[float] = None

        self._archives: DailySavedArchivesModel = DailySavedArchivesModel(
            items=[],
            is_last_day_of_month_saved=False
        )

        # class members depending on settings
        self._heating_circuit_type = self._heating_circuit_settings.type
        self._calculation_period = self._heating_circuit_settings.regulation_parameters.calculation_period / 10

    def _get_settings(self) -> HeatingCircuitModel:
        app_root_path = pathlib.Path(os.path.dirname(__file__)).parent.parent
        regulator_settings_path = app_root_path.joinpath('data/settings/regulator_settings.json')

        with open(regulator_settings_path, mode='r', encoding='utf-8') as file:
            json = file.read()

        regulator_settings = RegulatorSettingsModel.parse_raw(json)

        return regulator_settings.heating_circuits.items[self._heating_circuit_index]

    def _refresh_settings(self):
        if time() - self._last_refreshing_settings_time > self._calculation_period * RegulationEngine.updating_settings_factor:
            self._heating_circuit_settings = self._get_settings()
            self._last_refreshing_settings_time = time()
            # class members depending on settings
            self._heating_circuit_type = self._heating_circuit_settings.type
            self._calculation_period = self._heating_circuit_settings.regulation_parameters.calculation_period / 10

            self._logger.debug(RegulationEngine.settings_refresh_debug_msg)

    def _get_calculated_temperatures(self, outdoor_temperature: float) -> TemperatureGraphItemModel:
        accurate_match_tg_item = next(
            (
                item
                for item in self._heating_circuit_settings.temperature_graph.items
                if item.outdoor_temperature == outdoor_temperature
            ),
            None
        )

        if accurate_match_tg_item is not None:
            return accurate_match_tg_item

        temperature_graph = sorted(
            self._heating_circuit_settings.temperature_graph.items,
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
                archive_file_name = f'{self._heating_circuit_settings.type.name}__{self._heating_circuit_index}__{start_current_day.strftime("%Y-%m-%dT%H:%M:%SZ").replace(":", "_")}.json.gz'
                root_folder = pathlib.Path(__file__).parent.parent.parent
                year_archives_folder = root_folder.joinpath(f'data/archives/{start_current_day.year}')
                year_archives_folder.mkdir(exist_ok=True)

                data_path = year_archives_folder.joinpath(
                    f'{archive_file_name}'
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
        if self._last_refreshing_rtc_time is None or time() - self._last_refreshing_rtc_time >= RegulationEngine.updating_rtc_period:
            self._rtc_datetime = equipments.get_rtc_datetime()
            self._last_refreshing_rtc_time = time()

            self._logger.debug(RegulationEngine.getting_current_rtc_debug_msg, f'{self._rtc_datetime}')

    def _get_default_room_temperature(self) -> float:
        control_mode = self._heating_circuit_settings.control_parameters.control_mode

        if control_mode not in [ControlModeModel.COMFORT, ControlModeModel.ECONOMY]:
            return RegulationEngine.default_room_temperature

        schedules = self._heating_circuit_settings.schedules

        if schedules is None or len(schedules.items) == 0:
            return RegulationEngine.default_room_temperature

        day_of_week = self._rtc_datetime.weekday() + 1
        schedule = next((item for item in schedules.items if item.day == day_of_week), None)

        if schedule is None:
            return RegulationEngine.default_room_temperature

        current_rtc_datetime = self._rtc_datetime.replace(microsecond=0)
        window = next((item for item in schedule.windows if item.start_time.time()
                      <= current_rtc_datetime.time() <= item.end_time.time()), None)

        if window is None:
            return RegulationEngine.default_room_temperature

        comfort_temperature = self._heating_circuit_settings.control_parameters .comfort_temperature
        economical_temperature = self._heating_circuit_settings.control_parameters .economical_temperature

        return comfort_temperature if control_mode == ControlModeModel.COMFORT else economical_temperature

    def _get_pid_impact_components(self, entry: PidImpactEntryModel) -> PidImpactResultComponentsModel:
        calc_temperatures = self._get_calculated_temperatures(entry.archive.outdoor_temperature)

        insensivity_threshold = self._heating_circuit_settings.regulation_parameters.insensivity_threshold

        room_temperature_influence = self._heating_circuit_settings.control_parameters.room_temperature_influence
        if room_temperature_influence is None or math.isinf(entry.archive.room_temperature):
            room_temperature_influence = RegulationEngine.default_room_temperature_influence

        return_pipe_temperature_influence = self._heating_circuit_settings.control_parameters.return_pipe_temperature_influence
        if math.isinf(entry.archive.room_temperature):
            return_pipe_temperature_influence = RegulationEngine.default_return_temperature_influence

        default_room_temperature = self._get_default_room_temperature()

        # TODO: missing sensors
        deviation = (calc_temperatures.supply_pipe_temperature - entry.archive.supply_pipe_temperature) + \
            (calc_temperatures.return_pipe_temperature - entry.archive.return_pipe_temperature) * return_pipe_temperature_influence + \
            (entry.archive.room_temperature - default_room_temperature) * room_temperature_influence

        total_deviation = entry.total_deviation + deviation

        if abs(calc_temperatures.supply_pipe_temperature - entry.archive.supply_pipe_temperature) <= insensivity_threshold:
            return PidImpactResultComponentsModel(
                deviation=deviation,
                total_deviation=0.0,
                proportional_impact=0.0,
                integration_impact=0.0,
                differentiation_impact=0.0
            )

        proportionality_factor = self._heating_circuit_settings.regulation_parameters.proportionality_factor
        integration_factor = self._heating_circuit_settings.regulation_parameters.integration_factor
        differentiation_factor = self._heating_circuit_settings.regulation_parameters.differentiation_factor

        if math.isinf(entry.deviation):
            entry.deviation = deviation

        full_pid_impact_range = self._heating_circuit_settings.regulation_parameters.full_pid_impact_range
        proportionality_factor_denominator = self._heating_circuit_settings.regulation_parameters.proportionality_factor_denominator
        integration_factor_denominator = self._heating_circuit_settings.regulation_parameters.integration_factor_denominator

        k = sum([1 if i > 0 else 0 for i in [proportionality_factor, integration_factor, differentiation_factor]])

        full_proportional_part_impact = full_pid_impact_range / k if proportionality_factor > 0 else 0
        full_integration_part_impact = full_pid_impact_range / k if integration_factor > 0 else 0
        full_differentiation_part_impact = full_pid_impact_range / k if differentiation_factor > 0 else 0

        proportional_part_impact = deviation * proportionality_factor / proportionality_factor_denominator
        integration_part_impact = total_deviation * integration_factor / integration_factor_denominator
        differentiation_part_impact = (entry.deviation - deviation) * differentiation_factor

        if proportional_part_impact > full_proportional_part_impact:
            proportional_part_impact = full_proportional_part_impact
        if proportional_part_impact < -full_proportional_part_impact:
            proportional_part_impact = -full_proportional_part_impact

        if integration_part_impact > full_integration_part_impact:
            integration_part_impact = full_integration_part_impact
        if integration_part_impact < -full_integration_part_impact:
            integration_part_impact = -full_integration_part_impact

        if differentiation_part_impact > full_differentiation_part_impact:
            differentiation_part_impact = full_differentiation_part_impact
        if differentiation_part_impact < -full_differentiation_part_impact:
            differentiation_part_impact = -full_differentiation_part_impact

        self._logger.debug(
            RegulationEngine.pid_impact_components_debug_msg,
            proportional_part_impact,
            integration_part_impact,
            differentiation_part_impact,
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

        full_pid_impact_range = self._heating_circuit_settings \
            .regulation_parameters \
            .full_pid_impact_range

        percented_pid_impart = 100 * pid_impart / full_pid_impact_range

        self._logger.debug(RegulationEngine.pid_impact_result_debug_msg, percented_pid_impart)

        return PidImpactResultModel(
            impact=percented_pid_impart,
            deviation=pid_impact_components.deviation,
            total_deviation=pid_impact_components.total_deviation
        )

    def _get_failure_action_state(self, archive: ArchiveModel) -> FailureActionTypeModel:
        outdoor_failure_action = self._heating_circuit_settings.control_parameters.outdoor_temperature_sensor_failure_action
        supply_pipe_failure_action = self._heating_circuit_settings.control_parameters.supply_pipe_temperature_sensor_failure_action

        if math.isinf(archive.supply_pipe_temperature):
            if supply_pipe_failure_action == SupplyPipeTemperatureSensorFailureActionTypeModel.NO_ACTION:
                return FailureActionTypeModel.NO_ACTION

            if supply_pipe_failure_action == SupplyPipeTemperatureSensorFailureActionTypeModel.CLOSE_VALVE:
                return FailureActionTypeModel.CLOSE_VALVE

            if supply_pipe_failure_action == SupplyPipeTemperatureSensorFailureActionTypeModel.OPEN_VALVE:
                return FailureActionTypeModel.OPEN_VALVE

            if supply_pipe_failure_action == SupplyPipeTemperatureSensorFailureActionTypeModel.ANALOG_VALVE_ERROR:
                return FailureActionTypeModel.ANALOG_VALVE_ERROR

        if math.isinf(archive.outdoor_temperature):
            if outdoor_failure_action == OutdoorTemperatureSensorFailureActionTypeModel.NO_ACTION:
                return FailureActionTypeModel.NO_ACTION

            if outdoor_failure_action == OutdoorTemperatureSensorFailureActionTypeModel.CLOSE_VALVE:
                return FailureActionTypeModel.CLOSE_VALVE

            if outdoor_failure_action == OutdoorTemperatureSensorFailureActionTypeModel.OPEN_VALVE:
                return FailureActionTypeModel.OPEN_VALVE

            if outdoor_failure_action == OutdoorTemperatureSensorFailureActionTypeModel.TEMPERATURE_SUSTENANCE:
                return FailureActionTypeModel.TEMPERATURE_SUSTENANCE

        return FailureActionTypeModel.NO_FAILURE

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
                    self._refresh_rtc_datetime()
                    archive = self._get_archive()

                self._save_archives(archive)

                failure_action_state = self._get_failure_action_state(archive)
                with self._shared_failure_action_state_lock:
                    self._shared_failure_action_state = failure_action_state

                if not failure_action_state == FailureActionTypeModel.NO_FAILURE:
                    continue

                # calc pid impact
                pid_impact_result = self._get_pid_impact_result(
                    entry=PidImpactEntryModel(
                        archive=archive,
                        deviation=deviation,
                        total_deviation=total_deviation
                    )
                )

                with self._shared_pid_impact_result_lock:
                    self._shared_pid_impact_result = PidImpactResultModel(
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

    def start(self) -> None:
        # start regulation thread
        self._logger.info(RegulationEngine.regulation_started_info_msg)

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
                self._logger.info(RegulationEngine.regulation_stopped_info_msg)

                break

            self._refresh_settings()

            failure_action_state = FailureActionTypeModel.NO_FAILURE
            with self._shared_failure_action_state_lock:
                failure_action_state = self._shared_failure_action_state

            # TODO: what about time accounting is failure_action_state is not equal NO_FAILURE
            # if you need to count down the time until a full cycle we should to define a flag variable "isSkipNormalImpact" (or something like that)
            if failure_action_state == FailureActionTypeModel.NO_ACTION:
                continue

            if failure_action_state == FailureActionTypeModel.OPEN_VALVE:
                with self._hardware_process_lock:
                    equipments.open_valve(heating_circuit_index=self._heating_circuit_index)
                continue

            if failure_action_state == FailureActionTypeModel.CLOSE_VALVE:
                with self._hardware_process_lock:
                    equipments.close_valve(heating_circuit_index=self._heating_circuit_index)
                continue

            # measure time of the beginning of the act on the regulator valve
            start_time = time()


            pid_impact_result: Optional[PidImpactResultModel] = None

            with self._shared_pid_impact_result_lock:
                if self._shared_pid_impact_result is not None:
                    pid_impact_result = PidImpactResultModel(
                        impact=self._shared_pid_impact_result.impact,
                        deviation=self._shared_pid_impact_result.deviation,
                        total_deviation=self._shared_pid_impact_result.total_deviation
                    )

            # get valuable settings values
            regulation_parameters = self._heating_circuit_settings.regulation_parameters

            # forming an impact to the requlation valve
            if pid_impact_result is not None:
                with self._hardware_process_lock:
                    impact_duration = abs(pid_impact_result.impact * regulation_parameters.pulse_duration_valve) / 100

                    if impact_duration > regulation_parameters.pulse_duration_valve:
                        impact_duration = regulation_parameters.pulse_duration_valve

                    equipments.set_valve_impact(
                        heating_circuit_index=self._heating_circuit_index,
                        impact_sign=pid_impact_result.impact > 0.0,
                        impact_duration=impact_duration
                    )

            end_time = time()
            delta = end_time - start_time

            # wait for the end of period of the act on the regulator valve
            if delta < regulation_parameters.pulse_duration_valve:
                sleep(regulation_parameters.pulse_duration_valve - delta)
                self._logger.debug(
                    RegulationEngine.regulation_slept_debug_msg,
                    delta,
                    regulation_parameters.pulse_duration_valve - delta
                )


@regulator_starter_metadata(
    heating_circuit_types=[
        HeatingCircuitTypeModel.HEATING,
        HeatingCircuitTypeModel.VENTILATION,
        # HeatingCircuitTypeModel.HOT_WATER
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
