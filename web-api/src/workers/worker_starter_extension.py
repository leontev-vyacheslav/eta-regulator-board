from threading import Thread, Lock
from typing import Optional

from flask import Flask

from models.abstracts.singleton import Singleton
import workers


class WorkerStarter(metaclass=Singleton):

    def __init__(self, app: Optional[Flask] = None, **kwargs):
        self._options = kwargs

        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        for w in workers.worker_register:
            lock = Lock()

            thread = Thread(
                target=w.worker,
                args=(app, w.interval, workers.environment_state, lock),
                daemon=True
            )
            thread.start()
