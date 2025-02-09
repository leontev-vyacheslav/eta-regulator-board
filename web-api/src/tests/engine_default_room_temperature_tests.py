from datetime import datetime, timezone
from multiprocessing import Event as ProcessEvent, Lock as ProcessLock

from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.enums.regulation_engine_mode_model import RegulationEngineLoggingLevelModel
from regulation.engine import RegulationEngine
from tests.testable_engines.auto_control_mode_testable_regulation_engine import AutoControlModeTestableRegulationEngine
from tests.testable_engines.schedules_testable_regulation_engine import SchedulesTestableRegulationEngine
from tests.testable_engines.base_settings_testable_regulation_engine import BaseSettingsTestableRegulationEngine, base_testable_settings


def get_default_room_temperature_no_comfort_or_econom_modes_check():
    hardware_process_lock = ProcessLock()
    process_cancellation_event = ProcessEvent()

    assertable_default_room_temperature = float('inf')

    RegulationEngine.default_room_temperature = assertable_default_room_temperature

    engine = AutoControlModeTestableRegulationEngine(
        heating_circuit_index=HeatingCircuitIndexModel.FIRST,
        process_cancellation_event=process_cancellation_event,
        hardwares_process_lock=hardware_process_lock,
        logging_level=RegulationEngineLoggingLevelModel.FULL_TRACE
    )

    default_room_temperature = engine._get_target_temperature()

    assert default_room_temperature == assertable_default_room_temperature


def get_default_room_temperature_comfort_no_schedules_check():
    hardware_process_lock = ProcessLock()
    process_cancellation_event = ProcessEvent()

    engine = BaseSettingsTestableRegulationEngine(
        heating_circuit_index=HeatingCircuitIndexModel.FIRST,
        process_cancellation_event=process_cancellation_event,
        hardwares_process_lock=hardware_process_lock,
        logging_level=RegulationEngineLoggingLevelModel.FULL_TRACE
    )

    assertable_default_room_temperature = float('inf')

    RegulationEngine.default_room_temperature = assertable_default_room_temperature

    default_room_temperature = engine._get_target_temperature()

    assert default_room_temperature == assertable_default_room_temperature


def get_default_room_temperature_comfort_no_schedule_for_weekday_check():
    hardware_process_lock = ProcessLock()
    process_cancellation_event = ProcessEvent()

    engine = SchedulesTestableRegulationEngine(
        heating_circuit_index=HeatingCircuitIndexModel.FIRST,
        process_cancellation_event=process_cancellation_event,
        hardwares_process_lock=hardware_process_lock,
        logging_level=RegulationEngineLoggingLevelModel.FULL_TRACE
    )

    assertable_default_room_temperature = float('inf')

    RegulationEngine.default_room_temperature = assertable_default_room_temperature

    engine._rtc_datetime = datetime(
        year=2024,
        month=6,
        day=17,  # week_day = 0 (1)
        hour=17,
        second=30,
        tzinfo=timezone.utc
    )

    default_room_temperature = engine._get_target_temperature()

    assert default_room_temperature == assertable_default_room_temperature


def get_default_room_temperature_comfort_has_schedule_no_window_check():
    hardware_process_lock = ProcessLock()
    process_cancellation_event = ProcessEvent()

    engine = SchedulesTestableRegulationEngine(
        heating_circuit_index=HeatingCircuitIndexModel.FIRST,
        process_cancellation_event=process_cancellation_event,
        hardwares_process_lock=hardware_process_lock,
        logging_level=RegulationEngineLoggingLevelModel.FULL_TRACE
    )

    assertable_default_room_temperature = float('inf')
    RegulationEngine.default_room_temperature = assertable_default_room_temperature

    engine._rtc_datetime = datetime(
        year=2024,
        month=6,
        day=18,  # week_day = 1 (2)
        hour=14,
        minute=30,
        tzinfo=timezone.utc
    )

    default_room_temperature = engine._get_target_temperature()

    assert default_room_temperature == assertable_default_room_temperature


def get_default_room_temperature_comfort_has_schedule_check():
    hardware_process_lock = ProcessLock()
    process_cancellation_event = ProcessEvent()

    engine = SchedulesTestableRegulationEngine(
        heating_circuit_index=HeatingCircuitIndexModel.FIRST,
        process_cancellation_event=process_cancellation_event,
        hardwares_process_lock=hardware_process_lock,
        logging_level=RegulationEngineLoggingLevelModel.FULL_TRACE
    )

    assertable_default_room_temperature = base_testable_settings.control_parameters.comfort_temperature

    engine._rtc_datetime = datetime(
        year=2024,
        month=6,
        day=18,  # week_day = 1 (2)
        hour=10,
        minute=30,
        tzinfo=timezone.utc
    )

    default_room_temperature = engine._get_target_temperature()

    assert default_room_temperature == assertable_default_room_temperature
