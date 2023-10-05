from typing import List

from pydantic import BaseModel


class TemperatureGraphItemModel(BaseModel):
    outdoor_temperature: float

    supply_pipe_temperature: float

    return_pipe_temperature: float


class TemperatureGraphModel(BaseModel):
    items: List[TemperatureGraphItemModel] = []
