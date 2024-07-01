from datetime import datetime
from typing import List

from models.abstracts.app_base_model import AppBaseModel
from models.regulator.archive_model import ArchiveModel


class ArchivesModel(AppBaseModel):
    items: List[ArchiveModel]


class DailySavedArchivesModel(ArchivesModel):
    is_last_day_of_month_saved: bool


    def json(self, *args, **kwargs):
        exclude = {'is_last_day_of_month_saved'}

        return super().json(*args, **kwargs, exclude=exclude)


class ArchivesDatesModel(AppBaseModel):
    items: List[datetime]
