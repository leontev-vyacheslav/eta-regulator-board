from typing import List
from datetime import datetime
from models.abstracts.app_base_model import AppBaseModel


class ScheduleWindowModel(AppBaseModel):
    id:  str

    start_time: datetime

    end_time: datetime

    desired_temperature: int


class ScheduleModel(AppBaseModel):
    id:  str

    day: int

    windows: List[ScheduleWindowModel]


# Расписания
class SchelulesModel(AppBaseModel):
    items: List[ScheduleModel] = []
