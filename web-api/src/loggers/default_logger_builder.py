import sys
import logging

from loggers.default_logger_formatter import DefaultLoggingFormatter


def build(name: str, default_level: int = logging.DEBUG):

    logger = logging.getLogger(name)
    logger.setLevel(default_level)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.DEBUG)
    handler.setFormatter(
        DefaultLoggingFormatter(
            '[%(utctime)s] [%(pid)d] [%(levelname)s] %(message)s'
        )
    )

    logger.addHandler(handler)

    return logger
