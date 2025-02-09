from typing import List
from models.regulator.enums.heating_circuit_type_model import HeatingCircuitTypeModel


def regulator_starter_metadata(heating_circuit_types: List[HeatingCircuitTypeModel]):
    """
    It's a decorator that allows to assign the certain heating systems that to be served an instance of the regulator engine
    """
    def inner(func):
        func.heating_circuit_types = heating_circuit_types

        return func

    return inner
