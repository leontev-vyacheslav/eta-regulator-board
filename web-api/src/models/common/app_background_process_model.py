from datetime import datetime
from multiprocessing import Process, Event


class AppBackgroundProcessModel:
    """
    It's a non-serializable model that contains important informatioon about the running child background process.
    An object of this model is placed in the collection of background processes for the possibility of management
    """

    def __init__(self, name: str, process: Process, cancellation_event: Event, lifetime: int, data: dict) -> None:
        self.name = name
        self.process = process
        self.cancellation_event = cancellation_event
        self.creation_date = datetime.utcnow()
        self.lifetime = lifetime
        self.data = data
