from enum import IntEnum


class HeatingCircuitTypeModel(IntEnum):
    HEATING = 1
    HOT_WATER = 2
    VENTILATION = 3

type = HeatingCircuitTypeModel.HEATING
print(f"{type.name}")