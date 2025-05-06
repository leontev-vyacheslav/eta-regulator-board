from datetime import datetime
from typing import Optional

from models.abstracts.app_base_model import AppBaseModel
from models.regulator.temperature_graph_model import TemperatureGraphItemModel


class ArchiveModel(AppBaseModel):
    datetime: datetime

    outdoor_temperature: float

    room_temperature: float

    supply_pipe_temperature: float

    return_pipe_temperature: float

    is_initial: Optional[bool]


class ArchiveExistsModel(AppBaseModel):
    exists: bool


class ExtendedArchiveModel(ArchiveModel):

    @staticmethod
    def build(archive: ArchiveModel, calculated_temperatures: TemperatureGraphItemModel):
        return ExtendedArchiveModel(
            datetime=archive.datetime,
            outdoor_temperature=archive.outdoor_temperature,
            room_temperature=archive.room_temperature,
            supply_pipe_temperature=archive.supply_pipe_temperature,
            return_pipe_temperature=archive.return_pipe_temperature,
            is_initial=archive.is_initial,

            calculated_supply_pipe_temperature=calculated_temperatures.supply_pipe_temperature,
            calculated_return_pipe_temperature=calculated_temperatures.return_pipe_temperature,
        )

    calculated_supply_pipe_temperature: float
    calculated_return_pipe_temperature: float
