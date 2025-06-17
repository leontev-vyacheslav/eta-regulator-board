import logging
import pytest
from remote.models.parameter_types import ParameterTypes
from remote.remote_connector_registers import RemoteConnectorRegisters

logger = logging.getLogger(__name__)


@pytest.fixture(scope='module')
def get_expected_params_map():
    params_map = {
        'name': [0, 92],
        'type': [16, 108],
        'control_parameters.manual_control_mode': [18, 110],
        'control_parameters.control_circulation_pump': [41, 133],
        'regulation_parameters.drive_unit_analog_control':  [52, 144],
        'regulation_parameters.integration_factor_denominator': [59, 151],
        'shared_regulator_state.total_deviation': [79, 171],
        'shared_regulator_state.failure_action_state': [83, 175],
        'shared_regulator_state.return_pipe_temperature_calculated': [86, 178]
    }

    return params_map


def get_max_address_check():
    max_address = RemoteConnectorRegisters.get_max_address()
    assert max_address == 92


def get_heating_circuit_address_by_name_check(get_expected_params_map):
    params_map = get_expected_params_map

    for param_name, adresses in params_map.items():
        for heating_circuit_index in [0, 1]:
            address, param_info = RemoteConnectorRegisters.get_heating_circuit_address_by_name(heating_circuit_index, param_name)

            assert address == adresses[heating_circuit_index]

            assert param_info.name == param_name


def get_param_info_by_address_check(get_expected_params_map):
    params_map = get_expected_params_map

    for param_name, adresses in params_map.items():
        for address in adresses:
            _, param_info, _ = RemoteConnectorRegisters.get_param_info_by_address(address)
            assert param_info.name == param_name


def print_heating_circuit_addresses_check():
    print()
    print('-------------------------------------------------------------------------------------------------------------------------------')
    previous_section_name = None
    print('MAP: List[ParameterModel] = [')
    for param in RemoteConnectorRegisters.MAP:
        address1, _ = RemoteConnectorRegisters.get_heating_circuit_address_by_name(0, param.name)
        address2, _ = RemoteConnectorRegisters.get_heating_circuit_address_by_name(1, param.name)

        a1_1 = address1
        a1_2 = address1 + param.length - 1
        a2_1 = address2
        a2_2 = address2 + param.length - 1

        s1 = f'{a1_1}' if a1_1 == a1_2 else f'{a1_1}-{a1_2}'
        s2 = f'{a2_1}' if a2_1 == a2_2 else f'{a2_1}-{a2_2}'

        if '.' not in param.name:
            section_name = '# Basic parameters'
        elif param.name.startswith('control_parameters.'):
            section_name = '# Control parameters'
        elif param.name.startswith('regulation_parameters.'):
            section_name = '# Regulation parameters'
        elif param.name.startswith('shared_regulator_state.'):
            section_name = '# Shared regulator state'


        if previous_section_name != section_name:
            if previous_section_name is not None:
                print()

            print(section_name)
            previous_section_name = section_name

        print(
            f'\t{param.__class__.__name__}' +
            f'(name=\'{param.name}\'{", length=" + str(param.length) if param.data_type == ParameterTypes.STRING else "" }{", readonly=True" if param.readonly else ""}), ' +
            f'# {s1} | {s2} '
        )
    print(']')
