from typing import List
from models.abstracts.app_base_model import AppBaseModel
from models.regulator.regulator_parameters_model import RegulatorParametersModel


class HeatingCircuitModel(AppBaseModel):
    name: str

    regulatorParameters: RegulatorParametersModel


class HeatingCircuitsModel(AppBaseModel):
    items: List[HeatingCircuitModel]
