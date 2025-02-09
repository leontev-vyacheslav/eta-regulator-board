import os
import glob
import importlib
from threading import Thread, Lock
from typing import Optional

from flask_ex import FlaskEx
import workers


class WorkerStarter():

    def __init__(self, app: Optional[FlaskEx] = None, **kwargs):
        self._options = kwargs

        if app is not None:
            self.init_app(app)

    def init_app(self, app: FlaskEx):

        worker_files = glob.glob(
            app.app_root_path.joinpath(f'src/{workers.__name__}/*.py').__str__()
        )

        for worker_path in worker_files:
            worker_module_name, _ = os.path.splitext(os.path.basename(worker_path))
            worker_module = importlib.import_module(f'.{worker_module_name}', workers.__name__)

            for worker_info in app.internal_settings.workers:

                if hasattr(worker_module, worker_info.name):
                    worker = getattr(worker_module, worker_info.name)
                    lock = Lock()

                    thread = Thread(
                        target=worker,
                        args=(app, worker_info.interval, worker_info.immediately, lock),
                        daemon=True
                    )
                    thread.start()
