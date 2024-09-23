from typing import Callable, Optional

from models.abstracts.app_base_model import AppBaseModel

# TODO: deprecated
class WorkerInfoModel(AppBaseModel):
    worker: Optional[Callable] = None

    interval: int = 0
