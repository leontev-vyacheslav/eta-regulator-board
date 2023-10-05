from models.abstracts.app_base_model import AppBaseModel

from models.regulator.enums.control_mode_model import ControlModeModel
from models.regulator.enums.manual_control_mode_model import ManualControlModeModel
from models.regulator.enums.valve_position_state_model import ValvePositionStateModel


class ControlModel(AppBaseModel):
    control_mode: ControlModeModel = ControlModeModel.AUTO

    manual_control_mode: ManualControlModeModel = ManualControlModeModel.VALVE

    valve_position_state: ValvePositionStateModel = ValvePositionStateModel.HALTING

    manual_control_mode_temperature_setpoint: float = 60.0

    analog_valve_setpoint: float = 50.0

    comfort_temperature: float = 23.5

    economical_temperature: float = 17.0

    room_temperarture_influence: float = 2.0

    return_pipe_temperature_influience: float = 1.0

    supply_pipe_min_temperature: float = 30.0

    supply_pipe_max_temperature: float = 90.0

    starting_circulation_pump: int = 1

    starting_recharge_pump: int = 1
