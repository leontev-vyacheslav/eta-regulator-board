from typing import Callable, Optional
from pydantic import BaseModel


class WorkerInfoModel(BaseModel):
    worker: Optional[Callable] = None

    interval: int = 0
