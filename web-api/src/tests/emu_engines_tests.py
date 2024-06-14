import pytest
from multiprocessing import Event as ProcessEvent, Lock as ProcessLock
from threading import Event as ThreadingEvent

from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.enums.regulation_engine_mode_model import RegulationEngineLoggingLevelModel
from regulation.emulation.emu_engine_1 import EmuSupplyPipeTempStepVariationRegulationEngine
from regulation.emulation.emu_engine_2 import EmuOutdoorTempStepVariationRegulationEngine


@pytest.fixture(scope='module')
def get_regulation_engine_equipment():
    hardware_process_lock = ProcessLock()
    process_cancellation_event = ProcessEvent()
    threading_cancellation_event = ThreadingEvent()

    return (hardware_process_lock, process_cancellation_event, threading_cancellation_event)


def supply_pipe_temp_step_variation_check(get_regulation_engine_equipment):
    (hardware_process_lock, process_cancellation_event, threading_cancellation_event) = get_regulation_engine_equipment

    engine = EmuSupplyPipeTempStepVariationRegulationEngine(
        heating_circuit_index=HeatingCircuitIndexModel.FIRST,
        process_cancellation_event=process_cancellation_event,
        hardwares_process_lock=hardware_process_lock,
        logging_level=RegulationEngineLoggingLevelModel.FULL_TRACE
    )
    engine._refresh_rtc_datetime()

    assert engine is not None

    engine._start_sensors_polling(threading_cancellation_event)


def outdoor_temp_step_variation_check(get_regulation_engine_equipment):
    (hardware_process_lock, process_cancellation_event, threading_cancellation_event) = get_regulation_engine_equipment

    engine = EmuOutdoorTempStepVariationRegulationEngine(
        heating_circuit_index=HeatingCircuitIndexModel.FIRST,
        process_cancellation_event=process_cancellation_event,
        hardwares_process_lock=hardware_process_lock,
        logging_level=RegulationEngineLoggingLevelModel.FULL_TRACE
    )
    engine._refresh_rtc_datetime()

    assert engine is not None

    engine._start_sensors_polling(threading_cancellation_event)
