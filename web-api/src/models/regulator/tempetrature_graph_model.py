from typing import List

from models.abstracts.app_base_model import AppBaseModel


class TemperatureGraphItemModel(AppBaseModel):
    outdoor_temperature: float

    supply_pipe_temperature: float

    return_pipe_temperature: float


class TemperatureGraphModel(AppBaseModel):
    items: List[TemperatureGraphItemModel] = []
