from typing import Callable, List, Optional
from remote.models.float64_parameter_model import Float64ParameterModel

from remote.models.parameter_model import ParameterModel
from remote.models.bool_parameter_model import BoolParameterModel
from remote.models.float32_parameter_model import Float32ParameterModel
from remote.models.string_parameter_model import StringParameterModel
from remote.models.uint16_parameter_model import Uint16ParameterModel


class RemoteConnectorRegisters:

    MAP: List[ParameterModel] = [
        # Basic parameters
        StringParameterModel(name='name', length=16),  # 0-15 | 92-107
        Uint16ParameterModel(name='type', readonly=True),  # 16 | 108

        # Control parameters
        Uint16ParameterModel(name='control_parameters.control_mode'),  # 17 | 109
        Uint16ParameterModel(name='control_parameters.manual_control_mode'),  # 18 | 110
        Uint16ParameterModel(name='control_parameters.outdoor_temperature_sensor_failure_action'),  # 19 | 111
        Uint16ParameterModel(name='control_parameters.supply_pipe_temperature_sensor_failure_action'),  # 20 | 112
        Float32ParameterModel(name='control_parameters.manual_control_mode_temperature_setpoint'),  # 21-22 | 113-114
        Float32ParameterModel(name='control_parameters.analog_valve_error_setpoint'),  # 23-24 | 115-116
        Float32ParameterModel(name='control_parameters.summer_mode_transition_temperature'),  # 25-26 | 117-118
        Float32ParameterModel(name='control_parameters.comfort_temperature'),  # 27-28 | 119-120
        Float32ParameterModel(name='control_parameters.economical_temperature'),  # 29-30 | 121-122
        Float32ParameterModel(name='control_parameters.frost_protection_temperature'),  # 31-32 | 123-124
        Float32ParameterModel(name='control_parameters.room_temperature_influence'),  # 33-34 | 125-126
        Float32ParameterModel(name='control_parameters.return_pipe_temperature_influence'),  # 35-36 | 127-128
        Float32ParameterModel(name='control_parameters.supply_pipe_min_temperature'),  # 37-38 | 129-130
        Float32ParameterModel(name='control_parameters.supply_pipe_max_temperature'),  # 39-40 | 131-132
        BoolParameterModel(name='control_parameters.control_circulation_pump'),  # 41 | 133

        # Regulation parameters
        Float32ParameterModel(name='regulation_parameters.proportionality_factor'),  # 42-43 | 134-135
        Float32ParameterModel(name='regulation_parameters.integration_factor'),  # 44-45 | 136-137
        Float32ParameterModel(name='regulation_parameters.differentiation_factor'),  # 46-47 | 138-139
        Float32ParameterModel(name='regulation_parameters.calculation_period'),  # 48-49 | 140-141
        Float32ParameterModel(name='regulation_parameters.pulse_duration_valve'),  # 50-51 | 142-143
        BoolParameterModel(name='regulation_parameters.drive_unit_analog_control'),  # 52 | 144
        Float32ParameterModel(name='regulation_parameters.insensitivity_threshold'),  # 53-54 | 145-146
        Float32ParameterModel(name='regulation_parameters.full_pid_impact_range'),  # 55-56 | 147-148
        Float32ParameterModel(name='regulation_parameters.proportionality_factor_denominator'),  # 57-58 | 149-150
        Float32ParameterModel(name='regulation_parameters.integration_factor_denominator'),  # 59-60 | 151-152

        # Shared regulator state
        Float32ParameterModel(name='shared_regulator_state.outdoor_temperature', readonly=True),  # 61-62 | 153-154
        Float32ParameterModel(name='shared_regulator_state.room_temperature', readonly=True),  # 63-64 | 155-156
        Float32ParameterModel(name='shared_regulator_state.supply_pipe_temperature', readonly=True),  # 65-66 | 157-158
        Float32ParameterModel(name='shared_regulator_state.return_pipe_temperature', readonly=True),  # 67-68 | 159-160
        Float32ParameterModel(name='shared_regulator_state.impact', readonly=True),  # 69-70 | 161-162
        Float32ParameterModel(name='shared_regulator_state.proportional_impact', readonly=True),  # 71-72 | 163-164
        Float32ParameterModel(name='shared_regulator_state.integration_impact', readonly=True),  # 73-74 | 165-166
        Float32ParameterModel(name='shared_regulator_state.differentiation_impact', readonly=True),  # 75-76 | 167-168
        Float32ParameterModel(name='shared_regulator_state.deviation', readonly=True),  # 77-78 | 169-170
        Float32ParameterModel(name='shared_regulator_state.total_deviation', readonly=True),  # 79-80 | 171-172
        Float32ParameterModel(name='shared_regulator_state.delta_deviation', readonly=True),  # 81-82 | 173-174
        Uint16ParameterModel(name='shared_regulator_state.failure_action_state', readonly=True),  # 83 | 175
        Float32ParameterModel(name='shared_regulator_state.supply_pipe_temperature_calculated', readonly=True),  # 84-85 | 176-177
        Float32ParameterModel(name='shared_regulator_state.return_pipe_temperature_calculated', readonly=True),  # 86-87 | 178-179
        Float64ParameterModel(name='shared_regulator_state.datetime', readonly=True),  # 88-91 | 180-183
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
        max_address = RemoteConnectorRegisters.get_max_address()
        heating_circuit_index = 0 if 0 <= address < max_address else 1
        base_address = address - heating_circuit_index * max_address

        _, param_info = RemoteConnectorRegisters.__do_look_over(
            lambda _, total_address: total_address == base_address
        )

        if param_info is None:
            raise ValueError(f"The parameter at the address {address} was not found.")

        return address, param_info, heating_circuit_index

    @staticmethod
    def get_heating_circuit_address_by_name(heating_circuit_index: int, param_name: str):
        total_address = RemoteConnectorRegisters.get_max_address() if heating_circuit_index > 0 else 0
        for param in RemoteConnectorRegisters.MAP:
            if param.name == param_name:
                break
            total_address += param.length

        return total_address, param
