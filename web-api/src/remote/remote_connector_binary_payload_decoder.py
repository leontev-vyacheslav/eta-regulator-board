import struct
from pymodbus.payload import BinaryPayloadDecoder

class RemoteConnectorBinaryPayloadDecoder(BinaryPayloadDecoder):

    def decode_string_utf8(self):
        num_shorts = len(self._payload) // 2  # Each 'H' format is 2 bytes
        registers_unpacked = list(struct.unpack(f'!{num_shorts}H', self._payload))

        byte_data = bytearray()
        for reg in registers_unpacked:
            byte_data.append((reg >> 8) & 0xFF)
            byte_data.append(reg & 0xFF)

        # Remove any trailing null bytes and decode
        return byte_data.rstrip(b'\x00').decode('utf-8').strip()