import logging
import os
import fcntl
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
from models.regulator.enums.valve_direction_model import ValveDirectionModel

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
from models.regulator.pid_impact_entry_model import PidImpactEntryModel, PidImpactResultComponentsModel, PidImpactResultModel, SharedRegulatorStateModel
from models.regulator.regulator_settings_model import RegulatorSettingsModel
from models.regulator.enums.temperature_sensor_channel_model import TemperatureSensorChannelModel
from models.regulator.enums.failure_action_type_model import FailureActionTypeModel
from regulation.metadata.decorators import regulator_starter_metadata
from utils.datetime_helper import is_last_day_of_month


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
    getting_current_rtc_debug_msg = 'Current RTC datetime: %s'
    pid_impact_components_debug_msg = 'The PID impact components: P=%.2f, I=%.2f, D=%.2f, SUM=%.2f DEV=%.2f, TOTAL=%.2f'
    pid_impact_result_debug_msg = 'The PID impact result: RES=%.2f%%'
    writing_archives_error_msg = 'An error has happened during writing archives: %s'

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
        """
        It allows to get all settings according to the heating circuit index
        """
        app_root_path = pathlib.Path(os.path.dirname(__file__)).parent.parent
        regulator_settings_path = app_root_path.joinpath('data/settings/regulator_settings.json')

        with open(regulator_settings_path, mode='r', encoding='utf-8') as file:
            json = file.read()

        regulator_settings = RegulatorSettingsModel.parse_raw(json)

        return regulator_settings.heating_circuits.items[self._heating_circuit_index]

    def _refresh_settings(self):
        """
        It updates the current regulation channel settings
        after the expiration of a period of time equal to "calculation_period" * "updating_settings_factor" ( by default 2.5 * 5 sec)
        """
        if time() - self._last_refreshing_settings_time > self._calculation_period * RegulationEngine.updating_settings_factor:
            self._heating_circuit_settings = self._get_settings()
            self._last_refreshing_settings_time = time()
            # class members depending on settings
            self._heating_circuit_type = self._heating_circuit_settings.type
            self._calculation_period = self._heating_circuit_settings.regulation_parameters.calculation_period / 10

            self._logger.debug(RegulationEngine.settings_refresh_debug_msg)

    def _get_calculated_temperatures(self, outdoor_temperature: float) -> TemperatureGraphItemModel:
        """
        It is a function that allows to receive points (with supply and return pipes temperatures) on the temperature graphs based on
        the outdoor temperature that was obtained during the current sensors polling
        """
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
            id=uuid.UUID(int=0).hex,
            outdoor_temperature=outdoor_temperature_measured,
            supply_pipe_temperature=supply_pipe_temperature_calculated,
            return_pipe_temperature=return_pipe_temperature_calculated
        )

    def _get_archive(self) -> ArchiveModel:
        """
        It receives mesurment results from four temperature sensors (OUTDOOR, ROOM, SUPPLY_PIPE, RETURN_PIPE)
        and returns a packet of data in an object of the ArchiveModel class
        """
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

    def _save_shared_archive(self, shared_regulator_state: SharedRegulatorStateModel):
        root_folder = pathlib.Path(__file__).parent.parent.parent
        shared_archive_file_name = f'{self._heating_circuit_settings.type.name}__{self._heating_circuit_index}'
        shared_archive_path = root_folder.joinpath(f'data/archives/{shared_archive_file_name}')

        with open(shared_archive_path, "w") as shared_file:
            try:
                fcntl.flock(shared_file, fcntl.LOCK_EX)
                json_text = shared_regulator_state.json(by_alias=True)
                shared_file.write(json_text)
                shared_file.flush()
                os.fsync(shared_file.fileno())
            finally:
                fcntl.flock(shared_file, fcntl.LOCK_UN)

    def _save_archives(self, archive: ArchiveModel):
        """
        This procedure peforms saving the current received archive to an archive file
        """
        # clearing the current archives if the new day has come
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

        # calculating the hour boundaries
        start_current_hour = self._rtc_datetime.replace(**RegulationEngine.start_current_hour_template)
        end_current_hour = self._rtc_datetime.replace(**RegulationEngine.end_current_hour_template)

        is_already_saved = next((
            archive for archive in self._archives.items
            if archive.datetime >= start_current_hour and archive.datetime <= end_current_hour
        ),  None) is not None

        if is_already_saved:
            return

        # saving to the archive and rewriting the file of archives
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
        """
        It refreshes the working datetime according to a hardware managed date and time saved in the RTC
        """
        if self._last_refreshing_rtc_time is None or time() - self._last_refreshing_rtc_time >= RegulationEngine.updating_rtc_period:
            self._rtc_datetime = equipments.get_rtc_datetime()
            self._last_refreshing_rtc_time = time()

            self._logger.debug(RegulationEngine.getting_current_rtc_debug_msg, f'{self._rtc_datetime}')

    def _get_default_room_temperature(self) -> float:
        """
        The function allows to get the default room temperature based on
        the control mode of the regulator and/or its schedules
        """
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
        """
        It's the most important calculation function that allows to get each of the components of the algorithm PID regulation
        """
        calc_temperatures = self._get_calculated_temperatures(entry.archive.outdoor_temperature)

        insensivity_threshold = self._heating_circuit_settings.regulation_parameters.insensivity_threshold
        
        room_temperature_influence = self._heating_circuit_settings.control_parameters.room_temperature_influence
        if room_temperature_influence is None:
            room_temperature_influence = RegulationEngine.default_room_temperature_influence
        return_pipe_temperature_influence = self._heating_circuit_settings.control_parameters.return_pipe_temperature_influence

        default_room_temperature = self._get_default_room_temperature()

        deviation = (calc_temperatures.supply_pipe_temperature - entry.archive.supply_pipe_temperature) + \
            (0.0 if math.isinf(entry.archive.return_pipe_temperature) else (calc_temperatures.return_pipe_temperature - entry.archive.return_pipe_temperature) * return_pipe_temperature_influence) + \
            (0.0 if math.isinf(entry.archive.room_temperature) else (entry.archive.room_temperature - default_room_temperature) * room_temperature_influence)

        total_deviation = entry.total_deviation + deviation

        # the difference between measured and calculated values of the supply pipe temperatures less than the insensivity threshold
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
            total_deviation=pid_impact_components.total_deviation
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

        # the outdoor temperature sensor is missing
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
        """
        It begins an endless loop polling all of four temperature sensors.
        The measuring results are always saved in files partitioned by dates and separate folders by years
        """
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

            # here it will be served a HEATING or VENTILATION type of the regulation channel
            if self._heating_circuit_type in [HeatingCircuitTypeModel.HEATING, HeatingCircuitTypeModel.VENTILATION]:

                # putting on a process lock while receiving archives and current datetime
                with self._hardware_process_lock:
                    self._refresh_rtc_datetime()
                    archive = self._get_archive()

                self._save_archives(archive)

                # getting and sharing the failure action state among threads
                failure_action_state = self._get_failure_action_state(archive)
                with self._shared_failure_action_state_lock:
                    self._shared_failure_action_state = failure_action_state

                calculated_temperatures: TemperatureGraphItemModel = self._get_calculated_temperatures(archive.outdoor_temperature)

                if failure_action_state == FailureActionTypeModel.NO_FAILURE:
                    # calculating the PID impact result (a percentage value)
                    pid_impact_result = self._get_pid_impact_result(
                        entry=PidImpactEntryModel(
                            archive=archive,
                            deviation=deviation,
                            total_deviation=total_deviation
                        )
                    )

                    # sharing a value of the PID impact among the main and polling threads
                    with self._shared_pid_impact_result_lock:
                        self._shared_pid_impact_result = PidImpactResultModel(
                            impact=pid_impact_result.impact,
                            deviation=pid_impact_result.deviation,
                            total_deviation=pid_impact_result.total_deviation
                        )

                    deviation = pid_impact_result.deviation
                    total_deviation = pid_impact_result.total_deviation

                    self._save_shared_archive(SharedRegulatorStateModel(
                        failure_action_state=failure_action_state,

                        datetime=archive.datetime,
                        outdoor_temperature=archive.outdoor_temperature,
                        room_temperature=archive.room_temperature,
                        supply_pipe_temperature=archive.supply_pipe_temperature,
                        return_pipe_temperature=archive.return_pipe_temperature,

                        supply_pipe_temperature_calculated=calculated_temperatures.supply_pipe_temperature,
                        return_pipe_temperature_calculated=calculated_temperatures.return_pipe_temperature,

                        valve_direction=ValveDirectionModel.UP if pid_impact_result.impact > 0 else ValveDirectionModel.DOWN,
                        valve_position=pid_impact_result.impact,

                    ))
                else:
                    self._save_shared_archive(SharedRegulatorStateModel(
                        failure_action_state=failure_action_state,

                        valve_direction=ValveDirectionModel.UP,
                        valve_position=float("inf"),

                        supply_pipe_temperature_calculated=float("inf"),
                        return_pipe_temperature_calculated=float("inf"),

                        datetime=archive.datetime,
                        outdoor_temperature=float("inf"),
                        room_temperature=float("inf"),
                        supply_pipe_temperature=float("inf"),
                        return_pipe_temperature=float("inf")
                    ))
            # HOT_WATER
            else:
                pass

            end_time = time()
            delta = end_time - start_time
            if delta < self._calculation_period:
                sleep(self._calculation_period - delta)
                self._logger.debug(RegulationEngine.sensors_polling_slept_debug_msg, delta, self._calculation_period - delta)

    def start(self) -> None:
        """
        It's an entry point of the regutation machine
        which contains a loop that produces an impact to regulation valves.
        It executes in the main thread of a dedicated process of the regulation machine
        """

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

            self._logger.debug(f"The failure action state is: {failure_action_state.name}")

            # getting time of the beginning of the act on the regulator valve
            start_time = time()

            if failure_action_state == FailureActionTypeModel.NO_ACTION:
                pass

            if failure_action_state == FailureActionTypeModel.OPEN_VALVE:
                with self._hardware_process_lock:
                    equipments.open_valve(heating_circuit_index=self._heating_circuit_index)

            if failure_action_state == FailureActionTypeModel.CLOSE_VALVE:
                with self._hardware_process_lock:
                    equipments.close_valve(heating_circuit_index=self._heating_circuit_index)

            if failure_action_state == FailureActionTypeModel.NO_FAILURE:
                pid_impact_result: Optional[PidImpactResultModel] = None

                # putting on the thread lock to receive the PID impact result
                with self._shared_pid_impact_result_lock:
                    if self._shared_pid_impact_result is not None:
                        pid_impact_result = PidImpactResultModel(
                            impact=self._shared_pid_impact_result.impact,
                            deviation=self._shared_pid_impact_result.deviation,
                            total_deviation=self._shared_pid_impact_result.total_deviation
                        )

                # getting the valuable settings values
                # TODO: should I put on a thread lock or not?
                regulation_parameters = self._heating_circuit_settings.regulation_parameters

                # producing an impact to the requlation valve
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

            # waiting for the end of period of the act on the regulator valve
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
    """
    It's a dediated function that serves to start an execution of the regulation engine
    """
    engine = RegulationEngine(
        heating_circuit_index=heating_circuit_index,
        process_cancellation_event=process_cancellation_event,
        hardwares_process_lock=hardware_process_lock,
        logging_level=RegulationEngineLoggingLevelModel.FULL_TRACE
    )
    engine.start()
