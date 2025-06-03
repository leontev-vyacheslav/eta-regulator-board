from enum import Enum


class  SerialRemoteConnectorParitiesModel(Enum):
    NONE = 'N'   # No parity
    EVEN = 'E'   # Even parity
    ODD = 'O'    # Odd parity
    MARK = 'M'   # Parity bit always 1
    SPACE = 'S'  # Parity bit always 0