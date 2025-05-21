from typing import Callable, List, Optional

from remote.models.parameter_model import ParameterModel
from remote.models.bool_parameter_model import BoolParameterModel
from remote.models.float32_parameter_model import Float32ParameterModel
from remote.models.string_parameter_model import StringParameterModel
from remote.models.uint16_parameter_model import Uint16ParameterModel


class RemoteConnectorRegisters:

    MAP: List[ParameterModel] = [
        # Basic Parameters
        StringParameterModel(name='name', length=16),  # 0 - 15
        Uint16ParameterModel(name='type', readonly=True),  # 16

        # Control Parameters
        Uint16ParameterModel(name='control_parameters.control_mode'),  # 17
        Uint16ParameterModel(name='control_parameters.manual_control_mode'),  # 18
        Uint16ParameterModel(name='control_parameters.outdoor_temperature_sensor_failure_action'),  # 19
        Uint16ParameterModel(name='control_parameters.supply_pipe_temperature_sensor_failure_action'),  # 20

        Float32ParameterModel(name='control_parameters.manual_control_mode_temperature_setpoint'),  # 21-22
        Float32ParameterModel(name='control_parameters.analog_valve_error_setpoint'),  # 23-24
        Float32ParameterModel(name='control_parameters.summer_mode_transition_temperature'),  # 25-26
        Float32ParameterModel(name='control_parameters.comfort_temperature'),  # 27-28
        Float32ParameterModel(name='control_parameters.economical_temperature'),  # 29-30
        Float32ParameterModel(name='control_parameters.frost_protection_temperature'),  # 31-32
        Float32ParameterModel(name='control_parameters.room_temperature_influence'),  # 33-34
        Float32ParameterModel(name='control_parameters.return_pipe_temperature_influence'),  # 35-36
        Float32ParameterModel(name='control_parameters.supply_pipe_min_temperature'),  # 37-38
        Float32ParameterModel(name='control_parameters.supply_pipe_max_temperature'),  # 39-40
        BoolParameterModel(name='control_parameters.control_circulation_pump'),  # 41

        # Regulation Parameters
        Float32ParameterModel(name='regulation_parameters.proportionality_factor'),  # 42-43
        Float32ParameterModel(name='regulation_parameters.integration_factor'),  # 44-45
        Float32ParameterModel(name='regulation_parameters.differentiation_factor'),  # 46-47
        Float32ParameterModel(name='regulation_parameters.calculation_period'),  # 48-49
        Float32ParameterModel(name='regulation_parameters.pulse_duration_valve'),  # 50-51
        Float32ParameterModel(name='regulation_parameters.drive_unit_analog_control'),  # 52
        Float32ParameterModel(name='regulation_parameters.insensitivity_threshold'),  # 53-54
        Float32ParameterModel(name='regulation_parameters.full_pid_impact_range'),  # 55-56
        Float32ParameterModel(name='regulation_parameters.proportionality_factor_denominator'),  # 57-58
        Float32ParameterModel(name='regulation_parameters.integration_factor_denominator'),  # 59-60
    ]

    @staticmethod
    def __do_look_over(predicate: Optional[Callable] = None):
        total_address = 0
        is_found = predicate is None

        for param_info in RemoteConnectorRegisters.MAP:
            if predicate is not None and predicate(param_info.name, total_address):
                is_found = True
                break

            total_address += param_info.length

        if is_found:
            return total_address, param_info

        return None, None

    @staticmethod
    def get_max_address():
        total_address, _ = RemoteConnectorRegisters.__do_look_over()

        return total_address

    @staticmethod
    def get_param_info_by_name(param_name: str):
        param_info = next((p for p in RemoteConnectorRegisters.MAP if p.name == param_name), None)

        if param_info is None:
            raise ValueError(f"The parameter '{param_name}' was not found.")

        address, _ = RemoteConnectorRegisters.__do_look_over(
            lambda name, _: name == param_name
        )

        return address, param_info

    @staticmethod
    def get_param_info_by_address(address: int):
        _, param_info = RemoteConnectorRegisters.__do_look_over(
            lambda _, total_address: total_address == address
        )

        if param_info is None:
            raise ValueError(f"The parameter at the address {address} was not found.")

        return address, param_info
