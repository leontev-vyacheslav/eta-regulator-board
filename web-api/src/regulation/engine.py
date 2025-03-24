import logging
import os
import fcntl
import pathlib
import math
import gzip
import bisect
from datetime import datetime
from time import sleep, time
from multiprocessing import Event as ProcessEvent
from threading import Thread, Event as ThreadingEvent, Lock as ThreadingLock
from typing import Optional
import uuid
from models.regulator.shared_regulator_state_model import SharedRegulatorStateModel, get_default_shared_regulator_state
from models.regulator.enums.outdoor_temperature_sensor_failure_action_type_model import OutdoorTemperatureSensorFailureActionTypeModel
from models.regulator.enums.supply_pipe_temperature_sensor_failure_action_type_model import SupplyPipeTemperatureSensorFailureActionTypeModel

import regulation.equipments as equipments
from loggers.engine_logger_builder import build as build_logger
from models.regulator.enums.control_mode_model import ControlModeModel
from models.regulator.temperature_graph_model import TemperatureGraphItemModel
from models.regulator.archives_model import ArchivesModel, DailySavedArchivesModel
from models.regulator.archive_model import ArchiveModel
from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.enums.heating_circuit_type_model import HeatingCircuitTypeModel
from models.regulator.heating_circuits_model import HeatingCircuitModel
from models.regulator.pid_impact_entry_model import PidImpactEntryModel, PidImpactResultComponentsModel, PidImpactResultModel
from models.regulator.regulator_settings_model import RegulatorSettingsModel
from models.regulator.enums.temperature_sensor_channel_model import TemperatureSensorChannelModel
from models.regulator.enums.failure_action_type_model import FailureActionTypeModel
from regulation.metadata.decorators import regulator_starter_metadata
from utils.datetime_helper import is_last_day_of_month

class RegulationEngine:
    updating_rtc_period = 60
    default_room_temperature = 20
    default_hot_water_temperature = 60
    default_room_temperature_influence = 0.0
    default_return_temperature_influence = 0.0
    updating_settings_factor = 5

    start_current_hour_template = {'minute': 1, 'second': 0, 'microsecond': 0}
    end_current_hour_template = {'minute': 59, 'second': 59, 'microsecond': 0}
    start_current_day_template = {'hour': 0, 'minute': 0, 'second': 0, 'microsecond': 0}

    sensors_polling_started_info_msg = 'The polling thread was STARTED.'
    sensors_polling_stopped_info_msg = 'The polling thread was STOPPED.'
    sensors_polling_slept_debug_msg = 'The polling thread executed/slept during %.6f / %.6f sec.\r\n'
    sensors_polling_thread_error_msg = 'The polling thread was failed with the error: %s.'

    regulation_started_info_msg = 'The regulation thread was STARTED.'
    regulation_stopped_info_msg = 'The regulation thread was STOPPED.'
    regulation_stopped_critical_msg = "The regulation thread was STOPPED because the polling thread terminated with an error."
    regulation_slept_debug_msg = 'The regulation thread executed/slept during %.6f / %.6f sec.'
    regulation_thread_error_msg = 'The regulation thread was failed with the error: %s.'

    measured_temperatures_debug_msg = 'The measured temperatures: OUTDOOR=%.2f, ROOM=%.2f SUPPLY=%.2f; RETURN=%.2f'
    calculated_temperatures_debug_msg = 'The calculated temperatures: SUPPLY=%.2f, RETURN=%.2f'
    settings_refresh_debug_msg = 'Settings was refreshed'
    writing_archives_debug_msg = 'Writing archives has been completed: %s'
    getting_current_rtc_debug_msg = 'Current RTC datetime: %s'
    pid_impact_components_debug_msg = 'The PID impact components: P=%.2f, I=%.2f, D=%.2f, SUM=%.2f DEV=%.2f, TOTAL=%.2f'
    pid_impact_result_debug_msg = 'The PID impact result: PID=%.2f%%'
    analog_impact_result_debug_msg = 'The analog impact result: ANL=%.2f%%'
    writing_archives_error_msg = 'An error has happened during writing archives: %s'

    def __init__(self, heating_circuit_index: HeatingCircuitIndexModel, process_cancellation_event: ProcessEvent, logging_level: int) -> None:

        self._heating_circuit_index = heating_circuit_index
        self._process_cancellation_event = process_cancellation_event

        self._shared_pid_impact_result_lock = ThreadingLock()
        self._shared_pid_impact_result: Optional[PidImpactResultModel] = None
        self._shared_analog_valve_impact: float = 0.0

        self._shared_failure_action_state_lock = ThreadingLock()
        self._shared_failure_action_state = FailureActionTypeModel.NO_FAILURE

        self._shared_polling_error_lock = ThreadingLock()
        self._shared_polling_error: bool = False

        self._heating_circuit_settings: HeatingCircuitModel = self._get_settings()

        self._logger = build_logger(
            name=f'regulation_engine_logger_{heating_circuit_index}_{self._heating_circuit_settings.type.name}',
            heating_circuit_index=heating_circuit_index,
            heating_circuit_type=self._heating_circuit_settings.type,
            default_level=logging_level,
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
        """
        It allows to get all settings according to the heating circuit index
        """
        app_root_path = pathlib.Path(os.path.dirname(__file__)).parent.parent
        regulator_settings_path = app_root_path.joinpath('data/settings/regulator_settings.json')

        with open(regulator_settings_path, mode='r', encoding='utf-8') as file:
            try:
                fcntl.flock(file.fileno(), fcntl.LOCK_SH)
                json_text = file.read()
            finally:
                fcntl.flock(file.fileno(), fcntl.LOCK_UN)

            regulator_settings = RegulatorSettingsModel.parse_raw(json_text)

        return regulator_settings.heating_circuits.items[self._heating_circuit_index]

    def _refresh_settings(self):
        """
        It updates the current regulation channel settings
        after the expiration of a period of time equal to "calculation_period" * "updating_settings_factor" ( by default 2.5 * 5 sec)
        """
        if time() - self._last_refreshing_settings_time > self._calculation_period * RegulationEngine.updating_settings_factor:
            try:
                self._heating_circuit_settings = self._get_settings()
            except Exception as ex:
                self._logger.error("The refresh settings was failed.", ex, exc_info=True, stack_info=True)

                return

            self._last_refreshing_settings_time = time()
            # class members depending on settings
            self._heating_circuit_type = self._heating_circuit_settings.type
            self._calculation_period = self._heating_circuit_settings.regulation_parameters.calculation_period / 10

            self._logger.debug(RegulationEngine.settings_refresh_debug_msg)

    def _get_calculated_temperatures(self, outdoor_temperature: float) -> TemperatureGraphItemModel:
        """
        It is a function that allows to receive points (with supply and return pipes temperatures) on the temperature graphs based on
        the outdoor temperature that was obtained during the current sensors polling for the heating and ventilation heating circuits
        or as a target temperature for the hot water heating circuit
        """

        # The calculated temperatures for HOT_WATER match with a target temperatures according to the control mode
        if self._heating_circuit_type == HeatingCircuitTypeModel.HOT_WATER:
            target_temperature = self._get_target_temperature()

            self._logger.debug(
                RegulationEngine.calculated_temperatures_debug_msg,
                target_temperature,
                target_temperature
            )

            return TemperatureGraphItemModel(
                id=uuid.UUID(int=0).__str__(),
                outdoor_temperature=outdoor_temperature,
                supply_pipe_temperature=target_temperature,
                return_pipe_temperature=target_temperature,
            )

        # Otherwise, we should get the calculated temperatures according to the temperature graph
        if math.isinf(outdoor_temperature):
            return TemperatureGraphItemModel(
                id=uuid.UUID(int=0).__str__(),
                outdoor_temperature=float("inf"),
                supply_pipe_temperature=float("inf"),
                return_pipe_temperature=float("inf")
            )

        # trying to get the exact match on the temperature graph
        exact_match_tg_item = next(
            (
                item
                for item in self._heating_circuit_settings.temperature_graph.items
                if item.outdoor_temperature == outdoor_temperature
            ),
            None
        )

        if exact_match_tg_item is not None:
            return exact_match_tg_item

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
            # interpolating
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
            id=uuid.UUID(int=0).__str__(),
            outdoor_temperature=outdoor_temperature_measured,
            supply_pipe_temperature=supply_pipe_temperature_calculated,
            return_pipe_temperature=return_pipe_temperature_calculated
        )

    def _get_archive(self) -> ArchiveModel:
        """
        It receives measurement results from four temperature sensors (OUTDOOR, ROOM, SUPPLY_PIPE, RETURN_PIPE)
        and returns a packet of data in an object of the ArchiveModel class
        """
        outdoor_temperature_measured, room_temperature_measured, supply_pipe_temperature_measured, return_pipe_temperature_measured = \
            equipments.get_temperatures([
                TemperatureSensorChannelModel.OUTDOOR_TEMPERATURE,
                TemperatureSensorChannelModel.ROOM_TEMPERATURE,
                TemperatureSensorChannelModel[f'SUPPLY_PIPE_TEMPERATURE_{self._heating_circuit_index + 1}'],
                TemperatureSensorChannelModel[f'RETURN_PIPE_TEMPERATURE_{self._heating_circuit_index + 1}']
            ])

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

    def _save_shared_archive(self, shared_regulator_state: SharedRegulatorStateModel):
        """
        It performs saving the shared regulation state the values of which are used to display on mnenoschemas in the web UI app
        """
        root_folder = pathlib.Path(__file__).parent.parent.parent
        shared_archive_file_name = f'{self._heating_circuit_settings.type.name}__{self._heating_circuit_index}'
        shared_archive_path = root_folder.joinpath(f'data/archives/{shared_archive_file_name}')
        try:
            with open(shared_archive_path, "w", encoding="utf-8") as shared_file:
                try:
                    fcntl.flock(shared_file.fileno(), fcntl.LOCK_EX)
                    json_text = shared_regulator_state.json(by_alias=True)
                    shared_file.write(json_text)
                    shared_file.flush()
                    os.fsync(shared_file.fileno())
                finally:
                    fcntl.flock(shared_file.fileno(), fcntl.LOCK_UN)
        except Exception as ex:
            self._logger.error("The saving shared regulator state was failed.", ex, exc_info=True, stack_info=True)

    def _save_archives(self, archive: ArchiveModel):
        """
        This procedure performs saving the current received archive to an archive file
        """
        # clearing the current archives if the new day has come
        if self._archives.items:
            self._archives.items.sort(key=lambda arc: arc.datetime)
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

        # calculating the hour boundaries
        start_current_hour = self._rtc_datetime.replace(**RegulationEngine.start_current_hour_template)
        end_current_hour = self._rtc_datetime.replace(**RegulationEngine.end_current_hour_template)

        is_already_saved = next((
            archive for archive in self._archives.items
            if start_current_hour <= archive.datetime <= end_current_hour
        ),  None) is not None

        if is_already_saved:
            return

        # saving to the archive and rewriting the file of archives
        if self._rtc_datetime >= start_current_hour and not self._archives.is_last_day_of_month_saved:

            try:
                start_current_day = self._rtc_datetime.replace(**RegulationEngine.start_current_day_template)
                archive_file_name = f'{self._heating_circuit_settings.type.name}__{self._heating_circuit_index}__{start_current_day.strftime("%Y-%m-%dT%H:%M:%SZ").replace(":", "_")}.json.gz'
                root_folder = pathlib.Path(__file__).parent.parent.parent
                year_archives_folder = root_folder.joinpath(f'data/archives/{start_current_day.year}')
                year_archives_folder.mkdir(exist_ok=True)

                data_path = year_archives_folder.joinpath(
                    f'{archive_file_name}'
                )

                if len(self._archives.items) == 0 and data_path.exists():
                    with gzip.open(data_path, mode='r') as file:
                        zip_content = file.read()
                        json = zip_content.decode('utf-8')
                        existed_archives = ArchivesModel.parse_raw(json)
                        self._archives.items.extend(existed_archives.items)

                self._archives.items.append(archive)

                json_text = self._archives.json(by_alias=True, exclude_none=True)

                with gzip.open(data_path, mode='w') as file:
                    file.write(
                        json_text.encode()
                    )

                self._logger.debug(RegulationEngine.writing_archives_debug_msg, archive_file_name)

            except Exception as ex:
                self._logger.error(RegulationEngine.writing_archives_error_msg, str(ex))

    def _refresh_rtc_datetime(self):
        """
        It refreshes the working datetime according to a hardware managed date and time saved in the RTC
        """
        if self._last_refreshing_rtc_time is None or time() - self._last_refreshing_rtc_time >= RegulationEngine.updating_rtc_period:
            self._rtc_datetime = equipments.get_rtc_datetime()

            self._last_refreshing_rtc_time = time()
            self._logger.debug(RegulationEngine.getting_current_rtc_debug_msg, f'{self._rtc_datetime}')

    def _get_target_temperature(self) -> float:
        """
        The function allows to get a room/hot water temperature based on
        the control mode of the regulator and/or its schedules.
        It's important to notice that the target temperature for the HOT_WATER heating circuit is the hot water temperature, not the room temperature
        """
        control_mode = self._heating_circuit_settings.control_parameters.control_mode
        comfort_temperature = self._heating_circuit_settings.control_parameters.comfort_temperature
        economical_temperature = self._heating_circuit_settings.control_parameters.economical_temperature

        if self._heating_circuit_type == HeatingCircuitTypeModel.HOT_WATER:
            default_temperature = RegulationEngine.default_hot_water_temperature
        else:
            default_temperature = RegulationEngine.default_room_temperature

        if control_mode == ControlModeModel.COMFORT:
            return comfort_temperature

        if control_mode == ControlModeModel.ECONOMY:
            return economical_temperature

        if control_mode == ControlModeModel.AUTO:
            schedules = self._heating_circuit_settings.schedules

            if schedules is None or len(schedules.items) == 0:
                return default_temperature

            day_of_week = self._rtc_datetime.weekday() + 1
            schedule = next((item for item in schedules.items if item.day == day_of_week), None)

            if schedule is None:
                return default_temperature

            current_rtc_datetime = self._rtc_datetime.replace(microsecond=0)
            window = next((item for item in schedule.windows if item.start_time.time()
                           <= current_rtc_datetime.time() <= item.end_time.time()), None)

            if window is None:
                return default_temperature

            return comfort_temperature if window.desired_temperature_mode == ControlModeModel.COMFORT else economical_temperature
        else:
            return default_temperature

    def _get_pid_impact_components(self, entry: PidImpactEntryModel) -> PidImpactResultComponentsModel:
        """
        It's the most important calculation function that allows to get each of the components of the algorithm PID regulation
        """

        insensitivity_threshold = self._heating_circuit_settings.regulation_parameters.insensitivity_threshold
        manual_control_mode_temperature_setpoint = self._heating_circuit_settings.control_parameters.manual_control_mode_temperature_setpoint

        room_temperature_influence = self._heating_circuit_settings.control_parameters.room_temperature_influence
        if room_temperature_influence is None:
            room_temperature_influence = RegulationEngine.default_room_temperature_influence
        return_pipe_temperature_influence = self._heating_circuit_settings.control_parameters.return_pipe_temperature_influence

        target_temperature = self._get_target_temperature()

        if entry.failure_action_state != FailureActionTypeModel.TEMPERATURE_SUSTENANCE:
            calculated_temperatures: TemperatureGraphItemModel = self._get_calculated_temperatures(entry.archive.outdoor_temperature)
        else:
            calculated_temperatures = TemperatureGraphItemModel(
                id=uuid.UUID(int=0).__str__(),
                outdoor_temperature=float("inf"),
                supply_pipe_temperature=manual_control_mode_temperature_setpoint,
                return_pipe_temperature=float("inf"),
            )

        # the difference between measured and calculated values of the supply pipe temperatures less than the insensitivity threshold
        if abs(calculated_temperatures.supply_pipe_temperature - entry.archive.supply_pipe_temperature) <= insensitivity_threshold:
            return PidImpactResultComponentsModel(
                deviation=0.0,
                total_deviation=0.0,
                proportional_impact=0.0,
                integration_impact=0.0,
                differentiation_impact=0.0
            )

        deviation_supply_pipe_part = 0.0
        if not math.isinf(entry.archive.supply_pipe_temperature):
            deviation_supply_pipe_part = calculated_temperatures.supply_pipe_temperature - entry.archive.supply_pipe_temperature

        deviation_return_pipe_part = 0.0
        if not math.isinf(entry.archive.return_pipe_temperature) and not math.isinf(calculated_temperatures.return_pipe_temperature):
            deviation_return_pipe_part = (calculated_temperatures.return_pipe_temperature -
                                          entry.archive.return_pipe_temperature) * return_pipe_temperature_influence

        deviation_room_part = 0.0
        if not math.isinf(entry.archive.room_temperature):
            deviation_room_part = (entry.archive.room_temperature - target_temperature) * room_temperature_influence

        deviation = deviation_supply_pipe_part + \
            deviation_return_pipe_part + \
            deviation_room_part

        total_deviation = entry.total_deviation + deviation

        proportionality_factor = self._heating_circuit_settings.regulation_parameters.proportionality_factor
        integration_factor = self._heating_circuit_settings.regulation_parameters.integration_factor
        differentiation_factor = self._heating_circuit_settings.regulation_parameters.differentiation_factor

        # if the previous deviation is equal to infinity (on the first step) then the current deviation will be assigned to it
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
        """
        It is produces the final result impact as a sum of components
        and calculates the percentage value of it to the given full possible range of impact
        """
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
            total_deviation=pid_impact_components.total_deviation,

            proportional_impact=pid_impact_components.proportional_impact,
            integration_impact=pid_impact_components.integration_impact,
            differentiation_impact=pid_impact_components.differentiation_impact
        )

    def _get_failure_action_state(self, archive: ArchiveModel) -> FailureActionTypeModel:
        """
        This function returns the state of an error that may happen during sensors polling (generally when one of the sensors is missing or damaged)
        """
        supply_pipe_failure_action = self._heating_circuit_settings.control_parameters.supply_pipe_temperature_sensor_failure_action
        outdoor_failure_action = self._heating_circuit_settings.control_parameters.outdoor_temperature_sensor_failure_action

        # the supply pipe temperature sensor is missing
        if math.isinf(archive.supply_pipe_temperature):
            if supply_pipe_failure_action == SupplyPipeTemperatureSensorFailureActionTypeModel.NO_ACTION:
                return FailureActionTypeModel.NO_ACTION

            if supply_pipe_failure_action == SupplyPipeTemperatureSensorFailureActionTypeModel.CLOSE_VALVE:
                return FailureActionTypeModel.CLOSE_VALVE

            if supply_pipe_failure_action == SupplyPipeTemperatureSensorFailureActionTypeModel.OPEN_VALVE:
                return FailureActionTypeModel.OPEN_VALVE

            if supply_pipe_failure_action == SupplyPipeTemperatureSensorFailureActionTypeModel.ANALOG_VALVE_ERROR:
                return FailureActionTypeModel.ANALOG_VALVE_ERROR

        # the outdoor temperature sensor is missing for the heating circuits are not "hot water"
        if outdoor_failure_action is not None and self._heating_circuit_type != HeatingCircuitTypeModel.HOT_WATER:
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

    def _run_polling(self, threading_cancellation_event: ThreadingEvent) -> None:
        """
        It begins an endless loop polling all four temperature sensors.
        The measuring results are always saved in files partitioned by dates and separate folders by years
        """
        self._logger.info(RegulationEngine.sensors_polling_started_info_msg)

        is_initial = True

        total_deviation: float = 0.0
        deviation: float = float('inf')
        analog_valve_impact = 0.0

        self._refresh_rtc_datetime()

        try:
            while True:
                if threading_cancellation_event.is_set():
                    # stop polling
                    self._logger.info(RegulationEngine.sensors_polling_stopped_info_msg)
                    break

                start_time = time()

                # putting on a process lock while receiving archives and current datetime
                self._refresh_rtc_datetime()
                archive = self._get_archive()

                if is_initial:
                    archive.is_initial = is_initial
                self._save_archives(archive)

                # getting and sharing the failure action state among threads
                failure_action_state = self._get_failure_action_state(archive)
                with self._shared_failure_action_state_lock:
                    self._shared_failure_action_state = failure_action_state

                calculated_temperatures: TemperatureGraphItemModel = self._get_calculated_temperatures(archive.outdoor_temperature)

                if failure_action_state in [FailureActionTypeModel.NO_FAILURE, FailureActionTypeModel.TEMPERATURE_SUSTENANCE]:
                    # calculating the PID impact result (a percentage value)
                    pid_impact_result = self._get_pid_impact_result(
                        entry=PidImpactEntryModel(
                            failure_action_state=failure_action_state,
                            archive=archive,
                            deviation=deviation,
                            total_deviation=total_deviation
                        )
                    )

                    drive_unit_analog_control = self._heating_circuit_settings.regulation_parameters.drive_unit_analog_control

                    if drive_unit_analog_control:
                        pulse_duration_valve = self._heating_circuit_settings.regulation_parameters.pulse_duration_valve
                        analog_valve_impact = analog_valve_impact + pid_impact_result.impact / \
                            (pulse_duration_valve / self._calculation_period)

                        self._logger.debug(RegulationEngine.analog_impact_result_debug_msg, analog_valve_impact)

                        if analog_valve_impact > 100.0:
                            analog_valve_impact = 100.0
                        elif analog_valve_impact < 0.0:
                            analog_valve_impact = 0.0

                    # sharing a value of the PID impact and the analog valve impact among the main and polling threads
                    with self._shared_pid_impact_result_lock:
                        self._shared_pid_impact_result = PidImpactResultModel(
                            impact=pid_impact_result.impact,
                            deviation=pid_impact_result.deviation,
                            total_deviation=pid_impact_result.total_deviation,

                            proportional_impact=pid_impact_result.proportional_impact,
                            integration_impact=pid_impact_result.integration_impact,
                            differentiation_impact=pid_impact_result.differentiation_impact
                        )
                        self._shared_analog_valve_impact = analog_valve_impact

                    delta_deviation = pid_impact_result.deviation - deviation
                    deviation = pid_impact_result.deviation
                    total_deviation = pid_impact_result.total_deviation

                    self._save_shared_archive(SharedRegulatorStateModel(
                        delta_deviation=delta_deviation,
                        deviation=pid_impact_result.deviation,
                        total_deviation=pid_impact_result.total_deviation,
                        proportional_impact=pid_impact_result.proportional_impact,
                        integration_impact=pid_impact_result.integration_impact,
                        differentiation_impact=pid_impact_result.differentiation_impact,
                        impact=analog_valve_impact if drive_unit_analog_control == True else pid_impact_result.impact,

                        failure_action_state=failure_action_state,

                        datetime=archive.datetime,
                        outdoor_temperature=archive.outdoor_temperature,
                        room_temperature=archive.room_temperature,
                        supply_pipe_temperature=archive.supply_pipe_temperature,
                        return_pipe_temperature=archive.return_pipe_temperature,

                        supply_pipe_temperature_calculated=calculated_temperatures.supply_pipe_temperature,
                        return_pipe_temperature_calculated=calculated_temperatures.return_pipe_temperature,
                    ))
                else:
                    self._save_shared_archive(get_default_shared_regulator_state(archive.datetime, failure_action_state))

                end_time = time()
                delta = end_time - start_time
                if delta < self._calculation_period:
                    sleep(self._calculation_period - delta)
                    self._logger.debug(RegulationEngine.sensors_polling_slept_debug_msg, delta, self._calculation_period - delta)

                is_initial = None
        except Exception as ex:
            self._logger.error(RegulationEngine.sensors_polling_thread_error_msg, ex, exc_info=True, stack_info=True)

            with self._shared_polling_error_lock:
                self._shared_polling_error = True

    def start(self) -> None:
        """
        It's an entry point of the regulation machine
        which contains a loop that produces an impact to regulation valves.
        It executes in the main thread of a dedicated process of the regulation machine
        """

        self._logger.info(RegulationEngine.regulation_started_info_msg)

        # start polling temperature sensors and calculation
        threading_cancellation_event = ThreadingEvent()
        polling_thread = Thread(
            target=self._run_polling,
            args=(threading_cancellation_event, )
        )
        polling_thread.start()
        try:
            while True:
                if self._process_cancellation_event.is_set():
                    threading_cancellation_event.set()
                    polling_thread.join()
                    while polling_thread.is_alive():
                        time.sleep(0.5)
                        pass
                    # stop regulation thread
                    self._logger.info(RegulationEngine.regulation_stopped_info_msg)

                    break

                with self._shared_polling_error_lock:
                    if self._shared_polling_error:
                        if polling_thread.is_alive():
                            polling_thread.join()
                        self._logger.critical(RegulationEngine.regulation_stopped_critical_msg)
                        break

                self._refresh_settings()

                failure_action_state = FailureActionTypeModel.NO_FAILURE
                with self._shared_failure_action_state_lock:
                    failure_action_state = self._shared_failure_action_state

                self._logger.debug(f"The control mode is: {self._heating_circuit_settings.control_parameters.control_mode.name}",)
                self._logger.debug(f"The failure action state is: {failure_action_state.name}", )

                # getting time of the beginning of the act on the regulator valve
                start_time = time()

                # getting the valuable settings values
                # TODO: should I put on a thread lock or not?
                regulation_parameters = self._heating_circuit_settings.regulation_parameters

                if failure_action_state == FailureActionTypeModel.NO_ACTION:
                    pass

                if failure_action_state == FailureActionTypeModel.OPEN_VALVE:
                    equipments.open_valve(heating_circuit_index=self._heating_circuit_index)

                if failure_action_state == FailureActionTypeModel.CLOSE_VALVE:
                    equipments.close_valve(heating_circuit_index=self._heating_circuit_index)

                if failure_action_state == FailureActionTypeModel.ANALOG_VALVE_ERROR:
                    if regulation_parameters.drive_unit_analog_control:
                        equipments.set_analog_valve_impact(heating_circuit_index=self._heating_circuit_index, impact=50.0)

                if failure_action_state in [FailureActionTypeModel.NO_FAILURE, FailureActionTypeModel.TEMPERATURE_SUSTENANCE]:
                    pid_impact_result: Optional[PidImpactResultModel] = None
                    analog_valve_impact = 0.0

                    # putting on the thread lock to receive the PID impact result
                    with self._shared_pid_impact_result_lock:
                        if self._shared_pid_impact_result is not None:
                            pid_impact_result = PidImpactResultModel(
                                impact=self._shared_pid_impact_result.impact,
                                deviation=self._shared_pid_impact_result.deviation,
                                total_deviation=self._shared_pid_impact_result.total_deviation,

                                proportional_impact=self._shared_pid_impact_result.proportional_impact,
                                integration_impact=self._shared_pid_impact_result.integration_impact,
                                differentiation_impact=self._shared_pid_impact_result.differentiation_impact
                            )
                        analog_valve_impact = self._shared_analog_valve_impact

                    # producing an impact to the regulation valve
                    if pid_impact_result is not None:
                        if not regulation_parameters.drive_unit_analog_control:
                            impact_duration = abs(pid_impact_result.impact * regulation_parameters.pulse_duration_valve) / 100

                            if impact_duration > regulation_parameters.pulse_duration_valve:
                                impact_duration = regulation_parameters.pulse_duration_valve

                            equipments.set_valve_impact(
                                heating_circuit_index=self._heating_circuit_index,
                                impact_sign=pid_impact_result.impact > 0.0,
                                impact_duration=impact_duration
                            )
                        else:
                            equipments.set_analog_valve_impact(
                                heating_circuit_index=self._heating_circuit_index,
                                impact=analog_valve_impact
                            )

                end_time = time()
                delta = end_time - start_time

                # waiting for the end of period of the act on the regulator valve
                if delta < regulation_parameters.pulse_duration_valve:
                    sleep(regulation_parameters.pulse_duration_valve - delta)
                    self._logger.debug(
                        RegulationEngine.regulation_slept_debug_msg,
                        delta,
                        regulation_parameters.pulse_duration_valve - delta
                    )
        except Exception as ex:
            self._logger.error(RegulationEngine.regulation_thread_error_msg, ex, exc_info=True, stack_info=True)


@regulator_starter_metadata(
    heating_circuit_types=[
        HeatingCircuitTypeModel.HEATING,
        HeatingCircuitTypeModel.VENTILATION,
        HeatingCircuitTypeModel.HOT_WATER
    ]
)
def regulation_engine_starter(heating_circuit_index: HeatingCircuitIndexModel, process_cancellation_event: ProcessEvent):
    """
    It's a dedicated function that serves to initiate the execution of the regulation engine
    """
    engine = RegulationEngine(
        heating_circuit_index=heating_circuit_index,
        process_cancellation_event=process_cancellation_event,
        logging_level=logging.DEBUG
    )
    engine.start()
