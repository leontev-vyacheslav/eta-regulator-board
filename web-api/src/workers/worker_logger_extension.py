import logging
from typing import Optional
from flask import Flask


class WorkerLoggger:

    def __init__(self, app: Optional[Flask] = None, **kwargs) -> None:
        self._options = kwargs

        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        logger = logging.getLogger('worker_logger')

        logger.setLevel(logging.INFO)
        file_handler = logging.FileHandler('./worker.log', mode='w')
        formatter = logging.Formatter(
            fmt='%(asctime)s [%(levelname)s] %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

        app.worker_logger = logger
