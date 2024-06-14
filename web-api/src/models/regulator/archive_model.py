from datetime import datetime

from models.abstracts.app_base_model import AppBaseModel


class ArchiveModel(AppBaseModel):
    datetime: datetime

    outdoor_temperature: float

    room_temperature: float

    supply_pipe_temperature: float

    return_pipe_temperature: float