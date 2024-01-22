from datetime import datetime
from typing import List

from models.abstracts.app_base_model import AppBaseModel
from models.regulator.archive_model import ArchiveModel


class ArchivesModel(AppBaseModel):
    items: List[ArchiveModel]

class ArchivesDatesModel(AppBaseModel):
    items: List[datetime]
