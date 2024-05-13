from enum import IntEnum


class HeatingCircuitTypeModel(IntEnum):
    HEATING = 1
    HOT_WATER = 2
    VENTILATION = 3

type = HeatingCircuitTypeModel.HEATING
print(f"{type}")


class HeatingCircuitIndexModel(IntEnum):
    FIRST = 0
    SECOND = 1

print(HeatingCircuitIndexModel(1))