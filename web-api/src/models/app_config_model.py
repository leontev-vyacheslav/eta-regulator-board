from typing import List
from pydantic import BaseModel


class WorkerConfigInfo(BaseModel):
    name: str
    interval: int
    immediately: bool


class AppConfigModel(BaseModel):
    workers: List[WorkerConfigInfo] = []
