from threading import Lock, current_thread, get_ident
from time import sleep

from flask import Flask


def background_worker2(app: Flask, interval_sec, environment_state, lock: Lock):

    while True:
        sleep(interval_sec)
        with lock:
            environment_state.state_value_1 += 10
            environment_state.state_value_2 += 50

            if hasattr(app, 'worker_logger') and app.worker_logger is not None:
                app.worker_logger.info(
                    f'{current_thread().name} {get_ident()} -> {environment_state.json()}'
                )
