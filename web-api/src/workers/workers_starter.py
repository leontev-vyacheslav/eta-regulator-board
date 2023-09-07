from threading import Thread, Lock

from flask import Flask

from models.abstracts.singleton import Singleton
import workers


class WorkersStarter(metaclass=Singleton):

    def __init__(self, app: Flask):
        for w in workers.worker_register:
            lock = Lock()

            thread = Thread(
                target=w.worker,
                args=(app, w.interval, workers.environment_state, lock),
                daemon=True
            )
            thread.start()
