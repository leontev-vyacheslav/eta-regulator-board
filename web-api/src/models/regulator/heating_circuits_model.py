import uuid
from typing import List
from models.abstracts.app_base_model import AppBaseModel
from models.regulator.enums.heating_circuit_type_model import HeatingCircuitTypeModel
from models.regulator.regulator_parameters_model import RegulatorParametersModel


class HeatingCircuitModel(AppBaseModel):
    id: str

    name: str

    type: HeatingCircuitTypeModel

    regulatorParameters: RegulatorParametersModel

    def modify_identifiers(self):
        self.id = str(uuid.uuid4())

        for temperature_graph_item in self.regulatorParameters.temperature_graph.items:
            temperature_graph_item.id = str(uuid.uuid4())

        for schedule in self.regulatorParameters.schedules.items:
            schedule.id = str(uuid.uuid4())

            for window in schedule.windows:
                window.id = str(uuid.uuid4())


class HeatingCircuitsModel(AppBaseModel):
    items: List[HeatingCircuitModel]
