from typing import List

from models.abstracts.app_base_model import AppBaseModel
from models.common.worker_config_model import WorkerConfigModel


class InternalSettingsModel(AppBaseModel):
    workers: List[WorkerConfigModel] = []
