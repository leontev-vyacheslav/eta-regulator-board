from typing import List
from pydantic import BaseModel


class WorkerConfigInfo(BaseModel):
    name: str
    interval: int


class AppConfigModel(BaseModel):
    workers: List[WorkerConfigInfo] = []
