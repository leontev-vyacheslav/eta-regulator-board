from models.abstracts.app_base_model import AppBaseModel

from models.regulator.enums.control_mode_model import ControlModeModel
from models.regulator.enums.manual_control_mode_model import ManualControlModeModel
from models.regulator.enums.valve_position_state_model import ValvePositionStateModel


# Управление
class ControlParametersModel(AppBaseModel):

    # Режим управления = АВТ
    control_mode: ControlModeModel = ControlModeModel.AUTO

    # Режим ручного управления = КЛ
    manual_control_mode: ManualControlModeModel = ManualControlModeModel.VALVE

    # Действие клапана = СТП
    valve_position_state: ValvePositionStateModel = ValvePositionStateModel.HALTING

    # Уставка темп. ручного режима = 60.0
    manual_control_mode_temperature_setpoint: float = 60.0

    # Задание для аналог. клапана = 50%
    analog_valve_setpoint: float = 50.0

    # Температура комфортная = 23.5
    comfort_temperature: float = 23.5

    # Температура экономная = 17.0
    economical_temperature: float = 17.0

    # Влияние температуры помещения = 2.0
    room_temperarture_influence: float = 2.0

    # Влияние температуры обратки = 1.0
    return_pipe_temperature_influience: float = 1.0

    # Минимальная температура подачи = 30.0
    supply_pipe_min_temperature: float = 30.0

    # Максимальная температура подачи = 90.0
    supply_pipe_max_temperature: float = 90.0

    # Стартовый цирк. насос  = 1
    starting_circulation_pump: int = 1

    # Стартовый подп. насос = 1
    starting_recharge_pump: int = 1
