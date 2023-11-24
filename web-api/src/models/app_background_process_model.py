from datetime import datetime
from multiprocessing import Process, Event


class AppBackgroundProcessModel:

    def __init__(self, name: str, process: Process, event: Event, data: dict) -> None:
        self.name = name
        self.process = process
        self.event = event
        self.creation_date = datetime.utcnow()
        self.data = data
