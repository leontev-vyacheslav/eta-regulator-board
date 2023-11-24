from models.abstracts.app_base_model import AppBaseModel


class AciveSignalGenModel(AppBaseModel):
    pid: int

    signal_id: int
