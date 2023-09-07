from typing import List

from models.environment_state_model import EnvironmentState
from models.worker_info_model import WorkerInfoModel
from workers.background_worker1 import background_worker1
from workers.background_worker2 import background_worker2


environment_state = EnvironmentState()
worker_register: List[WorkerInfoModel] = []

worker_register.append(WorkerInfoModel(
    interval=10,
    worker=background_worker1
))

worker_register.append(WorkerInfoModel(
    interval=30,
    worker=background_worker2
))
