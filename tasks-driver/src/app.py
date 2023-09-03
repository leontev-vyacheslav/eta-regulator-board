import argparse
import logging
import logging.handlers
import sys
from threading import Thread, get_ident
from time import sleep
from typing import Optional


APP_VERSION = 'v.0.1.20230901-035348'


def init_logger():
    logger = logging.getLogger('main_logger')

    logger.setLevel(logging.INFO)
    file_handler = logging.FileHandler('./app.log', mode='w')
    formatter = logging.Formatter(
        fmt='%(asctime)s [%(levelname)s] %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    return logger


def background_task(interval_sec, message):
    while True:
        sleep(interval_sec)
        main_logger.info(f'{message} {get_ident()}')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("-m", "--main_thead_interval", type=int, default=60)
    parser.add_argument("-i1", "--interval1", type=int, default=10)
    parser.add_argument("-i2", "--interval2", type=int, default=5)
    args = parser.parse_args()

    if __debug__:
        main_logger.addHandler(logging.StreamHandler(sys.stdout))

    main_logger.info(f'Eta Regulator Board Web API {APP_VERSION}')

    deamons = [
        Thread(
            target=background_task,
            args=(args.interval1, 'Task1 thread'),
            daemon=True
        ),

        Thread(
            target=background_task,
            args=(args.interval2, 'Task2 thread'),
            daemon=True
        )
    ]

    for deamon in deamons:
        deamon.start()

    while True:
        main_logger.info('Main thread')
        sleep(args.main_thead_interval)


if __name__ == '__main__':
    main_logger: Optional[logging.Logger] = init_logger()
    main()
