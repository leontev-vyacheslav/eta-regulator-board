import os
import sys
import logging
import logging.handlers
import pathlib

from loggers.default_logger_formatter import DefaultLoggingFormatter
from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.enums.heating_circuit_type_model import HeatingCircuitTypeModel


def build(name: str, heating_circuit_index: HeatingCircuitIndexModel, heating_circuit_type: HeatingCircuitTypeModel, default_level: int = logging.DEBUG):

    logger = logging.getLogger(f'{name}_{heating_circuit_index}')
    logger.setLevel(default_level)

    stdout_formatter = DefaultLoggingFormatter(
        f'[%(utctime)s] [%(pid)d] [%(levelname)s] [{heating_circuit_index}, {heating_circuit_type.name}] %(message)s'
    )

    stdout_handler = logging.StreamHandler(sys.stdout)
    stdout_handler.setFormatter(stdout_formatter)
    logger.addHandler(stdout_handler)

    if os.environ.get('REGULATOR_ENGINE_LOGGING_TO_FILE') == '1':
        file_log_name = f'{heating_circuit_type.name}_{heating_circuit_index}'
        file_log_path = pathlib.Path(__file__).parent.parent.parent.joinpath(
            f'log/{file_log_name}'
        )
        file_handler = logging.handlers.TimedRotatingFileHandler(
            filename=file_log_path,
            when='m',
            interval=5,
            backupCount=250,
            encoding='utf-8',
        )
        file_formatter = DefaultLoggingFormatter(
            f'[%(utctime)s] [%(pid)d] [%(levelname)s] %(message)s'
        )
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)

    return logger
