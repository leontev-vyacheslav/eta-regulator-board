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
from regulation.engine import RegulationEngine
from remote.remote_connector_client import RemoteConnectorClient


logger = logging.getLogger(__name__)


@pytest.fixture(scope='module')
def remote_connector_client_equipment():
    host = '0.0.0.0'
    port = 5020
    return (host, port)


def remote_connector_client_check(remote_connector_client_equipment):
    (host, port) = remote_connector_client_equipment

    with RemoteConnectorClient(host=host, port=port) as connector:
        assert connector is not None

        type = connector.read(0, 'type')
        logger.info(f"Current heat circuit type: {type}")

        assert type == 1

        name = connector.read(0, 'name')
        logger.info(f"Current heat circuit name: {name}")

        assert name is not None

