from enum import IntEnum


class SupplyPipeTemperatureSensorFailureActionTypeModel(IntEnum):
    NO_ACTION = 1
    CLOSE_VALVE = 2
    OPEN_VALVE = 3
    ANALOG_VALVE_ERROR = 4
