from threading import Lock
from time import sleep
from datetime import datetime
from typing import List

from flask_ex import FlaskEx
from models.common.app_background_process_model import AppBackgroundProcessModel


def background_processes_watcher(app: FlaskEx, interval: float, immediately: bool, lock: Lock):
    if lock is None:
        raise Exception("The thread lock of the background processes watcher wasn't found.")

    while True:
        if not immediately:
            sleep(interval)

        with lock:
            try:
                removing_processes: List[AppBackgroundProcessModel] = []
                dead_processes: List[AppBackgroundProcessModel] = []

                for background_process in app.app_background_processes:
                    if background_process is not None:
                        if background_process.process.is_alive():
                            utc_now = datetime.utcnow()
                            duration = utc_now - background_process.creation_date
                            if duration.seconds > background_process.lifetime:
                                removing_processes.append(background_process)
                        else:
                            dead_processes.append(background_process)

                for removing_process in removing_processes:
                    if not removing_process.process.is_alive():
                        app.app_background_processes.remove(removing_process)
                        continue

                    pid = removing_process.process.pid

                    removing_process.cancellation_event.set()
                    removing_process.process.join()
                    app.app_background_processes.remove(removing_process)

                    app.app_logger.critical(f'The process \'{removing_process.name}\' with PID {pid} was stopped.')

                    if removing_process.relauncher:
                        app.app_logger.warn(f'The restart for \'{removing_process.name}\' will be performed.')
                        removing_process.relauncher()

                for dead_process in dead_processes:
                    app.app_background_processes.remove(dead_process)
                    if dead_process.relauncher:
                        app.app_logger.critical(f'The process \'{dead_process.name}\' was dead, but will be restarted.')
                        dead_process.relauncher()

            except Exception as ex:
                app.app_logger.error('The background process watcher was failed: %s', ex, exc_info=True, stack_info=True)

        if immediately:
            sleep(interval)
