from threading import Lock
from time import sleep
from datetime import datetime

from flask_ex import FlaskEx
from utils.debug_helper import is_debug


def background_processes_watcher(app: FlaskEx, interval: float, immediately: bool, environment_state, lock: Lock):

    while True:
        if not immediately:
            sleep(interval)

        active_signal_process_gen = next((p for p in app.app_background_processes), None)

        if active_signal_process_gen is not None:
            utc_now = datetime.utcnow()
            duration = utc_now - active_signal_process_gen.creation_date
            if duration.seconds > 60:
                pid = active_signal_process_gen.process.pid
                if is_debug():
                    active_signal_process_gen.process.terminate()

                active_signal_process_gen.event.set()
                app.app_background_processes.remove(active_signal_process_gen)

                app.worker_logger.info(
                    f'The active signal generator process with pid {pid} was forcibly stopped.'
                )

        app.worker_logger.info(
            'Worker \'background_processes_watcher\' is alive.'
        )

        if immediately:
            sleep(interval)
