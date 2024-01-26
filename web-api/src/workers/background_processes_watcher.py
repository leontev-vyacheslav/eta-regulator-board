from threading import Lock
from time import sleep
from datetime import datetime
from typing import List

from flask_ex import FlaskEx
from models.app_background_process_model import AppBackgroundProcessModel
from utils.debugging import is_debug


def background_processes_watcher(app: FlaskEx, interval: float, immediately: bool, environment_state, lock: Lock):

    while True:
        if not immediately:
            sleep(interval)

        removing_processes: List[AppBackgroundProcessModel] = []

        for background_process in app.app_background_processes:
            if background_process is not None:
                utc_now = datetime.utcnow()
                duration = utc_now - background_process.creation_date
                if duration.seconds > background_process.lifetime:
                    removing_processes.append(background_process)

        for removing_process in removing_processes:
            if not removing_process.process.is_alive():
                app.app_background_processes.remove(removing_process)
                continue

            pid = removing_process.process.pid

            if is_debug():
                removing_process.process.terminate()

            removing_process.cancellation_event.set()

            app.app_background_processes.remove(removing_process)

            app.worker_logger.info(
                f'The active background process "{removing_process.name}" with pid {pid} was forcibly stopped.'
            )

        app.worker_logger.info(
            'Worker \'background_processes_watcher\' is alive.'
        )

        if immediately:
            sleep(interval)
