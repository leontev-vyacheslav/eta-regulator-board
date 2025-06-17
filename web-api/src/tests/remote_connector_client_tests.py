import logging
import pytest

from remote.remote_connector_client import RemoteConnectorClient
from remote.remote_connector_registers import RemoteConnectorRegisters


logger = logging.getLogger(__name__)


@pytest.fixture(scope='module')
def remote_connector_client_equipment():
    host = '0.0.0.0'
    port = 5020
    params_map = {
        'type': [1, 2],
        'name': ['Контур ЦО', 'Контур ГВС'],
        'shared_regulator_state.impact': [100.0, 66.67],
    }

    return (host, port, params_map)


def remote_connector_client_simple_read_check(remote_connector_client_equipment):
    host, port, params_map = remote_connector_client_equipment

    with RemoteConnectorClient(host=host, port=port) as client:
        assert client is not None
        value = client.read(0, param_name='shared_regulator_state.total_deviation')
        pass


def remote_connector_client_read_check(remote_connector_client_equipment):
    host, port, params_map = remote_connector_client_equipment

    with RemoteConnectorClient(host=host, port=port) as client:
        assert client is not None
        for param_name, expected_values in params_map.items():
            for heating_circuit_index, expected_value in enumerate(expected_values):
                value = client.read(heating_circuit_index, param_name=param_name)
                if type(value) is float:
                    assert pytest.approx(value) == expected_value
                else:
                    assert value == expected_value


def remote_connector_client_write_check(remote_connector_client_equipment):
    host, port, params_map = remote_connector_client_equipment

    with RemoteConnectorClient(host=host, port=port) as client:
        assert client is not None

        for param_name, expected_values in params_map.items():
            for heating_circuit_index, expected_value in enumerate(expected_values):

                value = client.read(heating_circuit_index=heating_circuit_index, param_name=param_name)
                if type(value) is float:
                    assert pytest.approx(value) == expected_value
                else:
                    assert value == expected_value
                new_value = value

                if type(value) is str:
                    new_value = value + 'xyz'
                elif type(value) is float:
                    new_value = value + 0.1
                elif type(value) is int:
                    new_value = value + 1

                _, param_info = RemoteConnectorRegisters.get_param_info_by_name(param_name)
                assert param_info is not None
                if param_info.readonly:
                    new_value = value

                writing_result = client.write(heating_circuit_index, param_name, new_value)
                assert writing_result == True

                value_ = client.read(heating_circuit_index, param_name)
                assert value_ == new_value

                writing_result = client.write(heating_circuit_index, param_name, value)
                assert writing_result == True
