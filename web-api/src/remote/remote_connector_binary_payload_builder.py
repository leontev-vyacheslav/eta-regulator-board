from typing import Any

from pymodbus.payload import BinaryPayloadBuilder

from remote.models.parameter_model import ParameterModel
from remote.models.parameter_types import ParameterTypes

NULL_UINT16 = 0xFFFF
NULL_FLOAT = float('nan')


class RemoteConnectorBinaryPayloadBuilder (BinaryPayloadBuilder):

    def add_string_utf8(self, text, max_length):
        if len(text) > max_length:
            text = text[:max_length]
        else:
            text = text.ljust(max_length)
        byte_data = text.encode('utf-8')

        # Pad with zero if odd number of bytes (MODBUS requires 2 bytes per register)
        if len(byte_data) % 2 != 0:
            byte_data += b'\x00'

        for i in range(0, max_length * 2 - len(byte_data)):
            byte_data += b'\x00'

        for i in range(0, len(byte_data), 2):
            # Combine 2 bytes into a 16-bit unsigned integer
            high = byte_data[i]
            low = byte_data[i+1]
            val = (high << 8) | low  # Always 0 <= val <= 65535
            self.add_16bit_uint(val)

    def add_by_data_type(self, value: Any, param_info: ParameterModel):
        if param_info.data_type == ParameterTypes.UINT16:
            if value is not None and (not isinstance(value, int) or value < 0 or value > 65535):
                raise ValueError("Value must be uint16 (0-65535)")
            self.add_16bit_uint(NULL_UINT16 if value is None else value)

        elif param_info.data_type == ParameterTypes.FLOAT32:
            self.add_32bit_float(NULL_FLOAT if value is None else value)

        elif param_info.data_type == ParameterTypes.FLOAT64:
            self.add_64bit_float(NULL_FLOAT if value is None else value)

        elif param_info.data_type == ParameterTypes.BOOL:
            self.add_16bit_uint(1 if value else 0)

        elif param_info.data_type == ParameterTypes.STRING:
            self.add_string_utf8(value, param_info.length)
