from typing import List
from models.abstracts.app_base_model import AppBaseModel
from models.regulator.enums.heating_circuit_type_model import HeatingCircuitTypeModel
from models.regulator.regulator_parameters_model import RegulatorParametersModel


class HeatingCircuitModel(AppBaseModel):
    name: str

    type: HeatingCircuitTypeModel

    regulatorParameters: RegulatorParametersModel


class HeatingCircuitsModel(AppBaseModel):
    items: List[HeatingCircuitModel]
