
from models.abstracts.app_base_model import AppBaseModel
from models.regulator.enums.system_type_model import SystemTypeModel
from models.regulator.enums.valve_position_state_model import ValvePositionStateModel


# Программы
class RegulatorProgrammsModel(AppBaseModel):
    # тип системы
    system_type: SystemTypeModel

    heat_system_off: bool

    # управление циркуляционными насосами
    control_circulation_pumps: bool

    # переключения циркуляционных насосов
    switching_circulation_pumps: bool

    # период переключения ципркуляционных насосов
    switching_circulation_pumps_period: int

    # контроль циркуляционных насосов
    monitoring_circulation_pumps: bool

    # положение клапана при ошибке Тпод
    valve_position_by_supply_temperature_error: ValvePositionStateModel

    # положение клапана при ошибке Тнв
    valve_position_by_outdoor_temperature_error: ValvePositionStateModel

    # What means a 'подп. насос' ?

