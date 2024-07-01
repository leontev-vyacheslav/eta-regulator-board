from typing import List
from models.regulator.enums.heating_circuit_type_model import HeatingCircuitTypeModel


def regulator_starter_metadata(heating_circuit_types: List[HeatingCircuitTypeModel]):
    def inner(func):
        func.heating_circuit_types = heating_circuit_types

        return func

    return inner
