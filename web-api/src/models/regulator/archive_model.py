from datetime import datetime

from models.abstracts.app_base_model import AppBaseModel


class ArchiveModel(AppBaseModel):
    datetime: datetime

    outdoor_temperature: float

    room_temperature: float

    supply_pipe_temperature: float

    return_pipe_temperature: float


class ArchiveRangeModel(AppBaseModel):

    outdoor_temperature_min: float

    outdoor_temperature_max: float

    room_temperature_min: float

    room_temperature_max: float

    supply_pipe_temperature_min: float

    supply_pipe_temperature_max: float

    return_pipe_temperature_min: float

    return_pipe_temperature_max: float
