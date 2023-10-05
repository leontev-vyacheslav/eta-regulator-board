from typing import List

from models.abstracts.app_base_model import AppBaseModel


class WorkerConfigInfo(AppBaseModel):
    name: str
    interval: int
    immediately: bool


class AppConfigModel(AppBaseModel):
    workers: List[WorkerConfigInfo] = []
