from typing import List
from models.abstracts.app_base_model import AppBaseModel


class ScheduleTimeModel(AppBaseModel):
    hours: int

    minutes: int


class ScheduleWindowModel(AppBaseModel):
    id:  str

    start_time: ScheduleTimeModel

    end_time: ScheduleTimeModel

    desired_temperature: int


class ScheduleModel(AppBaseModel):
    id:  str

    day: int

    windows: List[ScheduleWindowModel]


# Расписания
class SchelulesModel(AppBaseModel):
    items: List[ScheduleModel] = []
