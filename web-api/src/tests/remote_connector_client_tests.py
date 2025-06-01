import logging
import os
import pathlib
from time import sleep
import pytest
import threading

from data_access.settings_repository_base import SettingsRepositoryBase
from remote.models.heating_circuit_index_model import HeatingCircuitIndexModel
from remote.remote_connector_client import RemoteConnectorClient
from remote.remote_connector_server import RemoteConnectorServer

# pylint: disable=unused-import
from models.regulator.regulator_settings_model import RegulatorSettingsModel

logger = logging.getLogger(__name__)


class RemoteConnectorSeverThread(threading.Thread):

    def __init__(self, host='0.0.0.0', port=5020):
        super(RemoteConnectorSeverThread, self).__init__()
        self.host = host
        self.port = port
        self._running = threading.Event()
        self._running.set()

        settings_repository = TestableRemoteConnectorServerRegulatorSettingsRepository(app=None)
        self.server = RemoteConnectorServer(app=None, host=host, port=port, regulator_settings_repository=settings_repository)

    def run(self):
        print("Modbus server started.")
        try:
            # serve_forever blocks, so run until _running is cleared
            while self._running.is_set():
                self.server.start()
        except Exception as e:
            print("Server error:", e)
        finally:
            print("Modbus server stopped.")

    def stop(self):
        print("Stopping server...")
        self._running.clear()
        self.server.server.server_close()  # Close the socket

class TestableRemoteConnectorServerRegulatorSettingsRepository(SettingsRepositoryBase):

    def __init__(self, app=None, **kwargs):

        root = pathlib.Path(os.path.dirname(__file__)).parent.parent
        self.data_path = root.joinpath(
            f'data/settings/regulator_settings.json'
        )

        with open(self.data_path, 'r', encoding='utf-8') as file:
            json_text = file.read()
            self.settings = getattr(globals().get('RegulatorSettingsModel'), 'parse_raw')(json_text)

            pass


@pytest.fixture(scope='module')
def remote_connector_client_equipment():
    host='0.0.0.0'
    port=5020

    return (host, port)


def remote_connector_client_read_type_check(remote_connector_client_equipment):
    host, port = remote_connector_client_equipment
    with RemoteConnectorClient(host=host, port=port) as client:
        assert client is not None

        type = client.read(heating_circuit_index=HeatingCircuitIndexModel.FIRST, param_name='type')
        logger.info(f"type = {type}")

        assert type == 1

def remote_connector_client_read_name_check(remote_connector_client_equipment):
    host, port = remote_connector_client_equipment
    with RemoteConnectorClient(host=host, port=port) as client:
        assert client is not None

        name = client.read(heating_circuit_index=HeatingCircuitIndexModel.FIRST, param_name='name')
        logger.info(f"name = {name}")

        assert name == 'Контур ЦО'


def remote_connector_client_write_name_check(remote_connector_client_equipment):
    host, port = remote_connector_client_equipment
    with RemoteConnectorClient(host=host, port=port) as client:
        assert client is not None


        new_curcuit_name = 'Тестовое имя'

        writing_result = client.write(heating_circuit_index=HeatingCircuitIndexModel.FIRST, param_name='name', value=new_curcuit_name)
        assert writing_result == True

        name = client.read(heating_circuit_index=HeatingCircuitIndexModel.FIRST, param_name='name')
        assert name == new_curcuit_name



        logger.info(f"name = {name}")


