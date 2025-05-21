import struct
from pymodbus.payload import BinaryPayloadDecoder

from remote.models.parameter_types import ParameterTypes

class RemoteConnectorBinaryPayloadDecoder(BinaryPayloadDecoder):

    def decode_string_utf8(self):
        num_shorts = len(self._payload) // 2
        registers_unpacked = list(struct.unpack(f'!{num_shorts}H', self._payload))

        byte_data = bytearray()
        for reg in registers_unpacked:
            byte_data.append((reg >> 8) & 0xFF)
            byte_data.append(reg & 0xFF)

        return byte_data.rstrip(b'\x00').decode('utf-8').strip()


    def decode_by_data_type(self, data_type: ParameterTypes):
        if data_type == ParameterTypes.UINT16:
            return self.decode_16bit_uint()
        elif data_type == ParameterTypes.FLOAT32:
            return self.decode_32bit_float()
        elif data_type == ParameterTypes.BOOL:
            return bool(self.decode_16bit_uint())
        elif data_type == ParameterTypes.STRING:
            return self.decode_string_utf8()