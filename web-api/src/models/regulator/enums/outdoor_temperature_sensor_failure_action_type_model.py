from enum import IntEnum


class OutdoorTemperatureSensorFailureActionTypeModel(IntEnum):
    NO_ACTION = 1
    CLOSE_VALVE = 2
    OPEN_VALVE = 3
    TEMPERATURE_SUSTENANCE = 5
