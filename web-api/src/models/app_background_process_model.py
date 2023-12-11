from datetime import datetime
from multiprocessing import Process, Event


class AppBackgroundProcessModel:

    def __init__(self, name: str, process: Process, cancellation_event: Event, lifetime: int, data: dict) -> None:
        self.name = name
        self.process = process
        self.cancellation_event = cancellation_event
        self.creation_date = datetime.utcnow()
        self.lifetime = lifetime
        self.data = data
