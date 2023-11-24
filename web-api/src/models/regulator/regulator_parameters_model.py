from models.abstracts.app_base_model import AppBaseModel

from models.regulator.control_parameters_model import ControlParametersModel
from models.regulator.regulation_parameters_model import RegulationParametersModel
from models.regulator.schedules_model import SchedulesModel
from models.regulator.temperature_graph_model import TemperatureGraphModel


# Параметры
class RegulatorParametersModel(AppBaseModel):
    # Управление
    control_parameters: ControlParametersModel

    # Темп. график
    temperature_graph: TemperatureGraphModel

    # Расписание
    schedules: SchedulesModel

    # Регулятор
    regulation_parameters: RegulationParametersModel
