import uuid
from typing import List

from models.abstracts.app_base_model import AppBaseModel
from models.regulator.enums.heating_circuit_type_model import HeatingCircuitTypeModel
from models.regulator.control_parameters_model import ControlParametersModel
from models.regulator.regulation_parameters_model import RegulationParametersModel
from models.regulator.schedules_model import SchedulesModel
from models.regulator.temperature_graph_model import TemperatureGraphModel


class HeatingCircuitModel(AppBaseModel):
    id: str

    name: str

    type: HeatingCircuitTypeModel

    # Управление
    control_parameters: ControlParametersModel

    # Темп. график
    temperature_graph: TemperatureGraphModel

    # Расписание
    schedules: SchedulesModel

    # Регулятор
    regulation_parameters: RegulationParametersModel

    def modify_identifiers(self):
        self.id = str(uuid.uuid4())

        for temperature_graph_item in self.temperature_graph.items:
            temperature_graph_item.id = str(uuid.uuid4())

        for schedule in self.schedules.items:
            schedule.id = str(uuid.uuid4())

            for window in schedule.windows:
                window.id = str(uuid.uuid4())


class HeatingCircuitsModel(AppBaseModel):
    items: List[HeatingCircuitModel]
