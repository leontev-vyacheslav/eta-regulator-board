from models.abstracts.app_base_model import AppBaseModel


class ActiveSignalGenModel(AppBaseModel):
    pid: int

    signal_id: int

    lifetime: int
