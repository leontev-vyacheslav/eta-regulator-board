import os
import pathlib
import sys
import logging
import logging.handlers

from loggers.default_logger_formatter import DefaultLoggingFormatter


def build(name: str, default_level: int = logging.DEBUG):

    logger = logging.getLogger(name)
    logger.setLevel(default_level)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        DefaultLoggingFormatter(
            '[%(utctime)s] [%(pid)d] [%(levelname)s] %(message)s'
        )
    )

    logger.addHandler(handler)

    if os.environ.get('APP_LOG_TO_FILE') == '1':
        file_log_path = pathlib.Path(__file__).parent.parent.parent.joinpath(
            f'log/app.log'
        )
        file_handler = logging.handlers.TimedRotatingFileHandler(
            filename=file_log_path,
            when='D',
            interval=1,
            backupCount=30,
            encoding='utf-8',
        )
        file_formatter = DefaultLoggingFormatter(
            f'[%(utctime)s] [%(pid)d] [%(levelname)s] %(message)s'
        )
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)

    return logger
