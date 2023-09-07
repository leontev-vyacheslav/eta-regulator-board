from threading import Lock, current_thread, get_ident
from time import sleep


def background_worker1(app, interval_sec, environment_state, lock: Lock):

    while True:
        sleep(interval_sec)
        with lock:
            environment_state.state_value_1 += 1
            environment_state.state_value_2 += 5

            if hasattr(app, 'worker_logger') and app.worker_logger is not None:
                app.worker_logger.info(
                    f'{current_thread().name} {get_ident()} -> {environment_state.json()}'
                )
