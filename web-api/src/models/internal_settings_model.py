from typing import List

from models.abstracts.app_base_model import AppBaseModel
from models.worker_config_info import WorkerConfigInfo


class InternalSettingsModel(AppBaseModel):
    workers: List[WorkerConfigInfo] = []
