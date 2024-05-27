import sys
import logging

from loggers.default_logger_formatter import DefaultLoggingFormatter
from models.regulator.enums.heating_circuit_index_model import HeatingCircuitIndexModel
from models.regulator.enums.heating_circuit_type_model import HeatingCircuitTypeModel

def build(name: str, heating_circuit_index: HeatingCircuitIndexModel, heating_circuit_type: HeatingCircuitTypeModel, default_level: int = logging.DEBUG, default_handler: logging.Handler=None):

    logger = logging.getLogger(f'{name}_{heating_circuit_index}')
    logger.setLevel(default_level)

    handler = logging.StreamHandler(sys.stdout) if default_handler is None else default_handler
    handler.setFormatter(
        DefaultLoggingFormatter(
            f'[%(utctime)s] [%(pid)d] [%(levelname)s] [{heating_circuit_index}, {heating_circuit_type.name}] %(message)s'
        )
    )

    logger.addHandler(handler)

    return logger
