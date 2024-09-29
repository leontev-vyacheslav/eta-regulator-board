from models.abstracts.app_base_model import AppBaseModel


class WorkerConfigModel(AppBaseModel):
    name: str

    interval: int

    immediately: bool
