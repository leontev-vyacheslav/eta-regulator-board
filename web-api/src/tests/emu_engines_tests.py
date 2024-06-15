import logging
from time import time
import pytest
from multiprocessing import Event as ProcessEvent, Lock as ProcessLock
from threading import Event as ThreadingEvent, Thread

from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.enums.regulation_engine_mode_model import RegulationEngineLoggingLevelModel
from regulation.engine import RegulationEngine
from tests.emulation.emu_engine_1 import EmuSupplyPipeTempStepVariationRegulationEngine
from tests.emulation.emu_engine_2 import EmuOutdoorTempStepVariationRegulationEngine

logger = logging.getLogger(__name__)


@pytest.fixture(scope='module')
def get_regulation_engine_equipment():
    hardware_process_lock = ProcessLock()
    process_cancellation_event = ProcessEvent()
    threading_cancellation_event = ThreadingEvent()

    return (hardware_process_lock, process_cancellation_event, threading_cancellation_event)


def engine_polling_runner(engine: RegulationEngine, threading_cancellation_event: ThreadingEvent, duration: float):

    def duration_observer(threading_cancellation_event, start_time, duration):
        logger.debug('The duration observer is started.')
        while True:
            if time() - start_time >= duration:
                threading_cancellation_event.set()
                logger.debug('The duration observer is stopped.')
                break

    engine._refresh_rtc_datetime()

    duration_thread = Thread(target=duration_observer, args=(threading_cancellation_event, time(), duration,))
    duration_thread.start()

    engine._start_sensors_polling(threading_cancellation_event)

@pytest.mark.parametrize("duration", [180.0])
def supply_pipe_temp_step_variation_check(get_regulation_engine_equipment, duration: float):
    (hardware_process_lock, process_cancellation_event, threading_cancellation_event) = get_regulation_engine_equipment

    engine = EmuSupplyPipeTempStepVariationRegulationEngine(
        heating_circuit_index=HeatingCircuitIndexModel.FIRST,
        process_cancellation_event=process_cancellation_event,
        hardwares_process_lock=hardware_process_lock,
        logging_level=RegulationEngineLoggingLevelModel.FULL_TRACE,
        step_duration=duration / 3
    )
    assert engine is not None

    engine_polling_runner(engine, threading_cancellation_event, duration)


@pytest.mark.parametrize("duration", [180.0])
def outdoor_temp_step_variation_check(get_regulation_engine_equipment, duration: float):
    (hardware_process_lock, process_cancellation_event, threading_cancellation_event) = get_regulation_engine_equipment

    engine = EmuOutdoorTempStepVariationRegulationEngine(
        heating_circuit_index=HeatingCircuitIndexModel.FIRST,
        process_cancellation_event=process_cancellation_event,
        hardwares_process_lock=hardware_process_lock,
        logging_level=RegulationEngineLoggingLevelModel.FULL_TRACE,
        step_duration=duration / 3
    )

    assert engine is not None

    engine_polling_runner(engine, threading_cancellation_event, duration)

