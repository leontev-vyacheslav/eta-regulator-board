from typing import Optional
from models.abstracts.app_base_model import AppBaseModel

from models.regulator.enums.control_mode_model import ControlModeModel
from models.regulator.enums.manual_control_mode_model import ManualControlModeModel


class ControlParametersModel(AppBaseModel):

    control_mode: ControlModeModel

    manual_control_mode: Optional[ManualControlModeModel]

    manual_control_mode_temperature_setpoint: Optional[float]

    analog_valve_error_setpoint: float

    summer_mode_transition_temperature: Optional[float]

    comfort_temperature: float

    economical_temperature: float

    frost_protection_temperature: Optional[float]

    room_temperature_influence: Optional[float]

    return_pipe_temperature_influence: float

    supply_pipe_min_temperature: float

    supply_pipe_max_temperature: float

    control_circulation_pump: bool
