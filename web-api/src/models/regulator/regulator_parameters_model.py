from models.abstracts.app_base_model import AppBaseModel

from models.regulator.control_parameters_model import ControlParametersModel
from models.regulator.emergency_verification_model import EmergencyVerificationModel
from models.regulator.regulation_parameters_model import RegulationParametersModel
from models.regulator.regulator_programms_model import RegulatorProgrammsModel
from models.regulator.schedules_model import SchelulesModel
from models.regulator.tempetrature_graph_model import TemperatureGraphModel

# Параметры
class RegulatorParametersModel(AppBaseModel):
    # Управление
    control_parameters: ControlParametersModel

    # Темп. график
    temperature_graph: TemperatureGraphModel

    # Программы
    programms: RegulatorProgrammsModel

    # Расписание
    schedules: SchelulesModel

    # Регулятор
    regulation_parameters: RegulationParametersModel

    # Контроль аварий
    emergency_verification: EmergencyVerificationModel
