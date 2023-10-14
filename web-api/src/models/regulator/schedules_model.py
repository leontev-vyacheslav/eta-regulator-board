from typing import List
from models.abstracts.app_base_model import AppBaseModel


class ScheduleModel(AppBaseModel):
    pass


# Расписания
class SchelulesModel(AppBaseModel):
    items: List[ScheduleModel] = []
