import gzip
import os
import shutil
import pathlib
from datetime import datetime, timedelta
import logging
from time import time
from random import random
from multiprocessing import Event as ProcessEvent, Lock as ProcessLock
import pytest

from freezegun import freeze_time

from models.regulator.archive_model import ArchiveModel
from models.regulator.archives_model import ArchivesModel
from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.enums.regulation_engine_mode_model import RegulationEngineLoggingLevelModel
from regulation.engine import RegulationEngine


logger = logging.getLogger(__name__)


@pytest.fixture(scope='module')
def get_regulation_engine() -> RegulationEngine:
    logger.setLevel(logging.DEBUG)

    hardware_process_lock = ProcessLock()
    process_cancellation_event = ProcessEvent()
    return RegulationEngine(
        heating_circuit_index=HeatingCircuitIndexModel.FIRST,
        process_cancellation_event=process_cancellation_event,
        hardwares_process_lock=hardware_process_lock,
        logging_level=RegulationEngineLoggingLevelModel.FULL_TRACE
    )


def refresh_rtc_datetime_init_check(get_regulation_engine: RegulationEngine):
    engine = get_regulation_engine

    assert engine is not None
    assert engine._last_refreshing_rtc_time is None

    engine._refresh_rtc_datetime()

    assert engine._last_refreshing_rtc_time is not None
    delta = time() - engine._last_refreshing_rtc_time
    assert delta < 0.01

    logger.debug(delta)


@pytest.mark.parametrize("freeze_time_tick", [600])
def save_archives_check(get_regulation_engine: RegulationEngine, freeze_time_tick: float):
    engine = get_regulation_engine

    assert engine is not None

    archives_folder = pathlib.Path(os.path.dirname(__file__)).parent.parent.joinpath('data/archives')
    shutil.rmtree(archives_folder, ignore_errors=True)
    os.makedirs(archives_folder)

    start_datetime = datetime.now()
    with freeze_time(start_datetime) as freezer:
        while True:
            if datetime.now() - start_datetime >= timedelta(days=365):
                break

            engine._refresh_rtc_datetime()
            engine._save_archives(
                archive=ArchiveModel(
                    datetime=engine._rtc_datetime,
                    outdoor_temperature=-60.0 * random() + 30.0,
                    room_temperature=7.0 * random() + 18,
                    supply_pipe_temperature=70 * random() + 30,
                    return_pipe_temperature=30 * random() + 30
                )
            )

            freezer.tick(timedelta(seconds=freeze_time_tick))

    archive_file_names = [
        f for f in archives_folder.iterdir()
        if f.is_file() and f.suffix == '.gz'
    ]
    achives_count = len(archive_file_names) - 1

    assert achives_count == 365

    for f in sorted(archive_file_names)[1:-1]:
        with gzip.open(f, mode='r') as file:
            json_text = file.read()
            archives = ArchivesModel.parse_raw(json_text, encoding='utf-8')

            assert len(archives.items) == 24
