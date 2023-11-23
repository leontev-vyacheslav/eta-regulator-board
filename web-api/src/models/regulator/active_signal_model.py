from multiprocessing import Process

from models.abstracts.app_base_model import AppBaseModel


class AciveSignalProcessGenModel:

    def __init__(self, process: Process, signal_id: int) -> None:
        self.process = process
        self.signal_id = signal_id


class AciveSignalGenModel(AppBaseModel):
    pid: int

    signal_id: int
