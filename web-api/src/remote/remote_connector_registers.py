from collections import OrderedDict


class RemoteConnectorRegisters:
    MAP = OrderedDict({
        'name': {'index': 0, 'data_type': 'string', 'length': 16},

        # Control Parameters
        'control_parameters.control_mode': {'index': 16, 'data_type': 'uint16'},
        'control_parameters.manual_control_mode': {'index': 17, 'data_type': 'uint16'},
        'control_parameters.outdoor_temperature_sensor_failure_action': {'index': 18, 'data_type': 'uint16'},
        'control_parameters.supply_pipe_temperature_sensor_failure_action': {'index': 19, 'data_type': 'uint16'},
        'control_parameters.manual_control_mode_temperature_setpoint': {'index': 20, 'data_type': 'float32'},
        'control_parameters.analog_valve_error_setpoint': {'index': 22, 'data_type': 'float32'},
        'control_parameters.summer_mode_transition_temperature': {'index': 24, 'data_type': 'float32'},
        'control_parameters.comfort_temperature': {'index': 26, 'data_type': 'float32'},
        'control_parameters.economical_temperature': {'index': 28, 'data_type': 'float32'},
        'control_parameters.frost_protection_temperature': {'index': 30, 'data_type': 'float32'},
        'control_parameters.room_temperature_influence': {'index': 32, 'data_type': 'float32'},
        'control_parameters.return_pipe_temperature_influence': {'index': 34, 'data_type': 'float32'},
        'control_parameters.supply_pipe_min_temperature': {'index': 36, 'data_type': 'float32'},
        'control_parameters.supply_pipe_max_temperature': {'index': 38, 'data_type': 'float32'},
        'control_parameters.control_circulation_pump': {'index': 40, 'data_type': 'bool'},

        # Regulation Parameters
        'regulation_parameters.proportionality_factor': {'index': 41, 'data_type': 'float32'},
        'regulation_parameters.integration_factor': {'index': 43, 'data_type': 'float32'},
        'regulation_parameters.differentiation_factor': {'index': 45, 'data_type': 'float32'},
        'regulation_parameters.calculation_period': {'index': 47, 'data_type': 'float32'},
        'regulation_parameters.pulse_duration_valve': {'index': 49, 'data_type': 'float32'},
        'regulation_parameters.drive_unit_analog_control': {'index': 51, 'data_type': 'bool'},
        'regulation_parameters.insensitivity_threshold': {'index': 53, 'data_type': 'float32'},
        'regulation_parameters.full_pid_impact_range': {'index': 55, 'data_type': 'float32'},
        'regulation_parameters.proportionality_factor_denominator': {'index': 57, 'data_type': 'float32'},
        'regulation_parameters.integration_factor_denominator': {'index': 59, 'data_type': 'float32'}
    })
