from enum import IntEnum


class FailureActionTypeModel(IntEnum):
    NO_ACTION = 1
    CLOSE_VALVE = 2
    OPEN_VALVE = 3
    ANALOG_VALVE_ERROR = 4
    TEMPERATURE_SUSTENANCE = 5
    NO_FAILURE = 6
